import assert from 'node:assert/strict'
import test from 'node:test'
import { createRenderer, h, nextTick, ref } from 'vue'
import { DatePicker } from '../dist/index.esm.js'

function createNode(type, text = '') {
  const node = { type, text, children: [], parent: null, props: {}, style: {} }
  const classes = new Set()
  node.classList = {
    add: (name) => classes.add(name),
    remove: (name) => classes.delete(name),
  }
  return node
}

const renderer = createRenderer({
  createElement: (tag) => createNode(tag),
  createText: (text) => createNode('#text', text),
  createComment: (text) => createNode('#comment', text),
  setText: (node, text) => { node.text = text },
  setElementText: (node, text) => {
    node.children = []
    node.text = text
  },
  patchProp: (node, key, previous, next) => {
    node.props[key] = next
    if (key === 'class') {
      node.classList = {
        add: (name) => { node.props.class = `${node.props.class || ''} ${name}`.trim() },
        remove: (name) => { node.props.class = (node.props.class || '').split(/\s+/).filter((part) => part !== name).join(' ') },
      }
    }
  },
  insert: (node, parent, anchor = null) => {
    if (node.parent) {
      node.parent.children.splice(node.parent.children.indexOf(node), 1)
    }
    const index = anchor ? parent.children.indexOf(anchor) : -1
    parent.children.splice(index < 0 ? parent.children.length : index, 0, node)
    node.parent = parent
  },
  remove: (node) => {
    if (node.parent) node.parent.children.splice(node.parent.children.indexOf(node), 1)
    node.parent = null
  },
  parentNode: (node) => node.parent,
  nextSibling: (node) => node.parent?.children[node.parent.children.indexOf(node) + 1] ?? null,
})

function descendants(node) {
  return [node, ...node.children.flatMap(descendants)]
}

function mountControlledRange() {
  const root = createNode('root')
  const range = ref({ start: null, end: null })
  const updates = []
  const app = renderer.createApp({
    render: () => h(DatePicker, {
      mode: 'range',
      date: '1404/01/10',
      range: range.value,
      'onUpdate:range': (value) => {
        updates.push({ ...value })
        range.value = value
      },
    }),
  })
  app.mount(root)

  async function clickDay(day) {
    const cell = descendants(root).find((node) =>
      node.props.class?.split(/\s+/).includes('vue-persia-datepicker__calendar_day') &&
      node.children[0]?.text === String(day)
    )
    assert.ok(cell, `day ${day} is rendered`)
    cell.props.onClick()
    await nextTick()
  }

  return { clickDay, updates, range, unmount: () => app.unmount() }
}

test('forward range completion emits a second controlled model update', async () => {
  const picker = mountControlledRange()
  try {
    await picker.clickDay(1)
    assert.deepEqual(picker.updates, [{ start: '1404/01/01', end: null }])

    await picker.clickDay(3)
    assert.deepEqual(picker.updates, [
      { start: '1404/01/01', end: null },
      { start: '1404/01/01', end: '1404/01/03' },
    ])
    assert.deepEqual(picker.range.value, { start: '1404/01/01', end: '1404/01/03' })
  } finally {
    picker.unmount()
  }
})

test('reverse range completion and a new selection keep their model updates', async () => {
  const picker = mountControlledRange()
  try {
    await picker.clickDay(3)
    await picker.clickDay(1)
    await picker.clickDay(5)
    assert.deepEqual(picker.updates, [
      { start: '1404/01/03', end: null },
      { start: '1404/01/01', end: '1404/01/03' },
      { start: '1404/01/05', end: null },
    ])
  } finally {
    picker.unmount()
  }
})

test('selecting the same day twice completes a range', async () => {
  const picker = mountControlledRange()
  try {
    await picker.clickDay(2)
    await picker.clickDay(2)
    assert.deepEqual(picker.updates, [
      { start: '1404/01/02', end: null },
      { start: '1404/01/02', end: '1404/01/02' },
    ])
  } finally {
    picker.unmount()
  }
})
