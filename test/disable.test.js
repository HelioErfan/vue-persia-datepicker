import assert from 'node:assert/strict'
import test from 'node:test'
import { createRenderer, h, nextTick, ref } from 'vue'
import { DatePicker } from '../dist/index.esm.js'

function createNode(type, text = '') {
  const node = { type, text, children: [], parent: null, props: {}, style: {} }
  node.classList = {
    add: (name) => { node.props.class = `${node.props.class || ''} ${name}`.trim() },
    remove: (name) => { node.props.class = (node.props.class || '').split(/\s+/).filter((part) => part !== name).join(' ') },
  }
  return node
}

const renderer = createRenderer({
  createElement: (tag) => createNode(tag),
  createText: (text) => createNode('#text', text),
  createComment: (text) => createNode('#comment', text),
  setText: (node, text) => { node.text = text },
  setElementText: (node, text) => { node.children = []; node.text = text },
  patchProp: (node, key, previous, next) => { node.props[key] = next },
  insert: (node, parent, anchor = null) => {
    if (node.parent) node.parent.children.splice(node.parent.children.indexOf(node), 1)
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

function mountPicker(mode, initialDisable) {
  const root = createNode('root')
  const disable = ref(initialDisable)
  const updates = []
  const app = renderer.createApp({
    render: () => h(DatePicker, {
      mode,
      date: '1404/01/10',
      disable: disable.value,
      'onUpdate:date': (value) => updates.push(value),
      'onUpdate:range': (value) => updates.push({ ...value }),
    }),
  })
  app.mount(root)

  function cell(day) {
    const found = descendants(root).find((node) =>
      node.props.class?.split(/\s+/).includes('vue-persia-datepicker__calendar_day') &&
      node.children[0]?.text === String(day)
    )
    assert.ok(found, `day ${day} is rendered`)
    return found
  }

  async function click(day) {
    cell(day).props.onClick()
    await nextTick()
  }

  return { cell, click, disable, updates, unmount: () => app.unmount() }
}

test('Friday is disabled and cannot update a single date', async () => {
  const picker = mountPicker('single', 'Friday')
  try {
    assert.match(picker.cell(1).props.class, /vue-persia-datepicker__calendar_day_disabled/)
    assert.equal(picker.cell(1).props['aria-disabled'], true)
    assert.doesNotMatch(picker.cell(2).props.class, /vue-persia-datepicker__calendar_day_disabled/)

    await picker.click(1)
    assert.deepEqual(picker.updates, [])
    await picker.click(2)
    assert.deepEqual(picker.updates, ['1404/01/02'])
  } finally {
    picker.unmount()
  }
})

test('Wednesday can be disabled on its own and the prop responds to changes', async () => {
  const picker = mountPicker('single', 'Wednesday')
  try {
    assert.match(picker.cell(6).props.class, /vue-persia-datepicker__calendar_day_disabled/)
    assert.doesNotMatch(picker.cell(1).props.class, /vue-persia-datepicker__calendar_day_disabled/)
    await picker.click(6)
    assert.deepEqual(picker.updates, [])

    picker.disable.value = 'Friday'
    await nextTick()
    assert.match(picker.cell(1).props.class, /vue-persia-datepicker__calendar_day_disabled/)
    assert.doesNotMatch(picker.cell(6).props.class, /vue-persia-datepicker__calendar_day_disabled/)
  } finally {
    picker.unmount()
  }
})

test('an array disables multiple weekdays as range endpoints', async () => {
  const picker = mountPicker('range', ['Friday', 'Wednesday'])
  try {
    await picker.click(1)
    await picker.click(6)
    assert.deepEqual(picker.updates, [])

    await picker.click(2)
    await picker.click(6)
    await picker.click(9)
    assert.deepEqual(picker.updates, [
      { start: '1404/01/02', end: null },
      { start: '1404/01/02', end: '1404/01/09' },
    ])
  } finally {
    picker.unmount()
  }
})
