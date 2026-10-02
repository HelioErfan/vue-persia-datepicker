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

function mountControlledRange({ initialRange = { start: null, end: null }, defaultRange, withModel = true, initialMode = 'range' } = {}) {
  const root = createNode('root')
  const mode = ref(initialMode)
  const range = ref(initialRange)
  const updates = []
  const dateUpdates = []
  const app = renderer.createApp({
    render: () => h(DatePicker, {
      mode: mode.value,
      date: '1404/01/10',
      'onUpdate:date': (value) => dateUpdates.push(value),
      ...(defaultRange && { defaultRange }),
      ...(withModel && {
        range: range.value,
        'onUpdate:range': (value) => {
          updates.push({ ...value })
          range.value = value
        },
      }),
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

  async function clickDay(day) {
    cell(day).props.onClick()
    await nextTick()
  }

  async function setRange(value) {
    range.value = value
    await nextTick()
  }

  async function setMode(value) {
    mode.value = value
    await nextTick()
  }

  function displayedMonth() {
    const title = descendants(root).find((node) => node.props.class === 'vue-persia-datepicker__header__month_year')
    return title.children.map((node) => node.text).join(' ')
  }

  return { cell, clickDay, setRange, setMode, displayedMonth, updates, dateUpdates, range, unmount: () => app.unmount() }
}

function hasClass(picker, day, className) {
  return picker.cell(day).props.class.split(/\s+/).includes(className)
}

test('switching from single to range changes the day grid to range selection', async () => {
  const picker = mountControlledRange({ initialMode: 'single' })
  try {
    assert.equal(hasClass(picker, 10, 'vue-persia-datepicker__calendar_day_selected'), true)

    await picker.setMode('range')
    await picker.clickDay(3)
    assert.deepEqual(picker.updates, [{ start: '1404/01/03', end: null }])
    assert.equal(hasClass(picker, 3, 'vue-persia-datepicker__calendar_is_range_start'), true)
    assert.equal(hasClass(picker, 3, 'vue-persia-datepicker__calendar_day_selected'), false)

    await picker.clickDay(5)
    assert.equal(hasClass(picker, 5, 'vue-persia-datepicker__calendar_is_range_end'), true)
  } finally {
    picker.unmount()
  }
})

test('switching from range to single changes the day grid to single selection', async () => {
  const picker = mountControlledRange({ initialRange: { start: '1404/01/02', end: null } })
  try {
    assert.equal(hasClass(picker, 2, 'vue-persia-datepicker__calendar_is_range_start'), true)

    await picker.setMode('single')
    await picker.clickDay(6)
    assert.deepEqual(picker.dateUpdates, ['1404/01/06'])
    assert.equal(hasClass(picker, 6, 'vue-persia-datepicker__calendar_day_selected'), true)
    assert.equal(hasClass(picker, 6, 'vue-persia-datepicker__calendar_is_range_start'), false)
  } finally {
    picker.unmount()
  }
})

test('initial range model opens its month and highlights its dates', () => {
  const picker = mountControlledRange({
    initialRange: { start: '1400/01/02', end: '1400/01/05' },
  })
  try {
    assert.equal(picker.displayedMonth(), 'فروردین ۱۴۰۰')
    assert.equal(hasClass(picker, 2, 'vue-persia-datepicker__calendar_is_range_start'), true)
    assert.equal(hasClass(picker, 3, 'vue-persia-datepicker__calendar_is_in_range'), true)
    assert.equal(hasClass(picker, 5, 'vue-persia-datepicker__calendar_is_range_end'), true)
  } finally {
    picker.unmount()
  }
})

test('defaultRange is shown without a model, while an explicit empty model wins', () => {
  const defaultRange = { start: '1404/01/02', end: '1404/01/05' }
  const picker = mountControlledRange({ defaultRange, withModel: false })
  const controlled = mountControlledRange({ defaultRange })
  try {
    assert.equal(hasClass(picker, 2, 'vue-persia-datepicker__calendar_is_range_start'), true)
    assert.equal(hasClass(picker, 5, 'vue-persia-datepicker__calendar_is_range_end'), true)
    assert.equal(hasClass(controlled, 2, 'vue-persia-datepicker__calendar_is_range_start'), false)
  } finally {
    picker.unmount()
    controlled.unmount()
  }
})

test('external range changes replace highlights and clearing removes them', async () => {
  const picker = mountControlledRange()
  try {
    await picker.setRange({ start: '1404/01/02', end: '1404/01/05' })
    assert.equal(hasClass(picker, 2, 'vue-persia-datepicker__calendar_is_range_start'), true)
    assert.equal(hasClass(picker, 3, 'vue-persia-datepicker__calendar_is_in_range'), true)
    assert.equal(hasClass(picker, 5, 'vue-persia-datepicker__calendar_is_range_end'), true)

    await picker.setRange({ start: '1404/01/10', end: '1404/01/12' })
    assert.equal(hasClass(picker, 2, 'vue-persia-datepicker__calendar_is_range_start'), false)
    assert.equal(hasClass(picker, 10, 'vue-persia-datepicker__calendar_is_range_start'), true)
    assert.equal(hasClass(picker, 12, 'vue-persia-datepicker__calendar_is_range_end'), true)

    await picker.setRange({ start: null, end: null })
    assert.equal(hasClass(picker, 10, 'vue-persia-datepicker__calendar_is_range_start'), false)
    assert.equal(hasClass(picker, 12, 'vue-persia-datepicker__calendar_is_range_end'), false)
    assert.deepEqual(picker.updates, [])
  } finally {
    picker.unmount()
  }
})

test('a click completes an incoming partial range', async () => {
  const picker = mountControlledRange({ initialRange: { start: '1404/01/02', end: null } })
  try {
    await picker.clickDay(5)
    assert.deepEqual(picker.updates, [{ start: '1404/01/02', end: '1404/01/05' }])
    assert.equal(hasClass(picker, 5, 'vue-persia-datepicker__calendar_is_range_end'), true)
  } finally {
    picker.unmount()
  }
})

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
