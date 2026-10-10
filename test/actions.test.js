import assert from 'node:assert/strict'
import test from 'node:test'
import { h, nextTick, ref } from 'vue'
import { DatePicker } from '../dist/index.esm.js'
import { createNode, descendants, installTransitionEnvironment, renderer } from './helpers/renderer.js'

test.before(installTransitionEnvironment)

async function flushUpdates() {
  // Vue's CSS transition advances through two frames, then updates its subtree.
  await nextTick()
  await nextTick()
  await nextTick()
}

function mountPicker({ date = '1404/01/10', range = { start: null, end: null }, withModels = true, slots, ...props } = {}) {
  const root = createNode('root')
  const inputs = ref({ showActions: true, ...props })
  const dateValue = ref(date)
  const rangeValue = ref(range)
  const dateUpdates = []
  const rangeUpdates = []
  const app = renderer.createApp({
    render: () => h(DatePicker, {
      ...inputs.value,
      ...(withModels && { date: dateValue.value, range: rangeValue.value }),
      'onUpdate:date': (value) => { dateUpdates.push(value); dateValue.value = value },
      'onUpdate:range': (value) => { rangeUpdates.push({ ...value }); rangeValue.value = value },
    }, slots),
  })
  app.mount(root)
  const nodes = () => descendants(root)
  const hasClass = (node, name) => node.props.class?.split(/\s+/).includes(name)
  const cell = (day) => nodes().find((node) => hasClass(node, 'vue-persia-datepicker__calendar_day') && node.children[0]?.text === String(day))
  const button = (label) => nodes().find((node) => node.type === 'button' && node.text === label)
  const click = async (node) => { assert.ok(node, 'interactive element exists'); node.props.onClick(); await flushUpdates() }
  return {
    root, nodes, cell, button, dateValue, rangeValue, dateUpdates, rangeUpdates,
    clickDay: (day) => click(cell(day)),
    clickButton: (label) => click(button(label)),
    hasDayClass: (day, name) => hasClass(cell(day), `vue-persia-datepicker__calendar_${name}`),
    title: () => nodes().find((node) => hasClass(node, 'vue-persia-datepicker__header__month_year')).children.map((node) => node.text).join(' '),
    setProps: async (value) => { inputs.value = { ...inputs.value, ...value }; await flushUpdates() },
    setDate: async (value) => { dateValue.value = value; await flushUpdates() },
    setRange: async (value) => { rangeValue.value = value; await flushUpdates() },
    unmount: () => app.unmount(),
  }
}

test('single selections are previewed without publishing before confirm', async (t) => {
  const picker = mountPicker()
  t.after(picker.unmount)
  await picker.clickDay(12)
  assert.deepEqual(picker.dateUpdates, [])
  assert.equal(picker.dateValue.value, '1404/01/10')
  assert.equal(picker.hasDayClass(12, 'day_selected'), true)
  await picker.clickButton('تایید')
  assert.deepEqual(picker.dateUpdates, ['1404/01/12'])
})

test('disabled actions preserve immediate single and range selection', async (t) => {
  for (const mode of ['single', 'range']) {
    const picker = mountPicker({ showActions: false, mode })
    t.after(picker.unmount)
    assert.equal(picker.button('تایید'), undefined)
    await picker.clickDay(12)
    assert.deepEqual(mode === 'single' ? picker.dateUpdates : picker.rangeUpdates,
      mode === 'single' ? ['1404/01/12'] : [{ start: '1404/01/12', end: null }])
  }
})

test('range previews do not mutate the parent and confirm ordered endpoints once', async (t) => {
  const initial = Object.freeze({ start: null, end: null })
  const picker = mountPicker({ mode: 'range', range: initial })
  t.after(picker.unmount)
  await picker.clickDay(12)
  await picker.clickDay(2)
  assert.deepEqual(picker.rangeUpdates, [])
  assert.deepEqual(initial, { start: null, end: null })
  assert.equal(picker.hasDayClass(2, 'is_range_start'), true)
  assert.equal(picker.hasDayClass(12, 'is_range_end'), true)
  await picker.clickButton('تایید')
  assert.deepEqual(picker.rangeUpdates, [{ start: '1404/01/02', end: '1404/01/12' }])
})

test('incomplete range cannot be confirmed even by calling its handler', async (t) => {
  const picker = mountPicker({ mode: 'range' })
  t.after(picker.unmount)
  await picker.clickDay(2)
  assert.equal(picker.button('تایید').props.disabled, true)
  await picker.clickButton('تایید')
  assert.deepEqual(picker.rangeUpdates, [])
  await picker.clickDay(2)
  assert.equal(picker.button('تایید').props.disabled, false)
  await picker.clickButton('تایید')
  assert.deepEqual(picker.rangeUpdates, [{ start: '1404/01/02', end: '1404/01/02' }])
})

test('empty single selection cannot be confirmed', async (t) => {
  const picker = mountPicker({ date: null })
  t.after(picker.unmount)
  assert.equal(picker.button('تایید').props.disabled, true)
  await picker.clickButton('تایید')
  assert.deepEqual(picker.dateUpdates, [])
})

test('cancel restores controlled and default single selections without publishing', async (t) => {
  for (const props of [{}, { withModels: false, defaultDate: '1404/01/10' }]) {
    const picker = mountPicker(props)
    t.after(picker.unmount)
    await picker.clickDay(12)
    await picker.clickButton('انصراف')
    assert.equal(picker.hasDayClass(10, 'day_selected'), true)
    assert.equal(picker.hasDayClass(12, 'day_selected'), false)
    assert.equal(picker.title(), 'فروردین ۱۴۰۴')
    assert.deepEqual(picker.dateUpdates, [])
  }
})

test('cancel restores controlled and default ranges without publishing', async (t) => {
  const saved = { start: '1404/01/02', end: '1404/01/05' }
  for (const props of [{ range: saved }, { withModels: false, defaultRange: saved }]) {
    const picker = mountPicker({ mode: 'range', ...props })
    t.after(picker.unmount)
    await picker.clickDay(12)
    await picker.clickDay(14)
    await picker.clickButton('انصراف')
    assert.equal(picker.hasDayClass(2, 'is_range_start'), true)
    assert.equal(picker.hasDayClass(5, 'is_range_end'), true)
    assert.deepEqual(picker.rangeUpdates, [])
  }
})

test('cancel restores the latest confirmed value in both modes', async (t) => {
  for (const mode of ['single', 'range']) {
    const picker = mountPicker({ mode })
    t.after(picker.unmount)
    await picker.clickDay(12)
    if (mode === 'range') await picker.clickDay(14)
    await picker.clickButton('تایید')
    await picker.clickDay(20)
    await picker.clickButton('انصراف')
    assert.equal(picker.hasDayClass(12, mode === 'single' ? 'day_selected' : 'is_range_start'), true)
    assert.equal((mode === 'single' ? picker.dateUpdates : picker.rangeUpdates).length, 1)
  }
})

test('external dates replace pending choices and become the cancel baseline', async (t) => {
  const picker = mountPicker()
  t.after(picker.unmount)
  await picker.clickDay(12)
  await picker.setDate('1404/02/05')
  assert.equal(picker.title(), 'اردیبهشت ۱۴۰۴')
  assert.equal(picker.hasDayClass(5, 'day_selected'), true)
  await picker.clickDay(8)
  await picker.clickButton('انصراف')
  assert.equal(picker.hasDayClass(5, 'day_selected'), true)
  await picker.setDate(null)
  assert.equal(picker.button('تایید').props.disabled, true)
  assert.deepEqual(picker.dateUpdates, [])
})

test('external range changes and clearing replace pending ranges', async (t) => {
  const picker = mountPicker({ mode: 'range' })
  t.after(picker.unmount)
  await picker.clickDay(12)
  await picker.setRange({ start: '1404/02/05', end: '1404/02/08' })
  assert.equal(picker.title(), 'اردیبهشت ۱۴۰۴')
  assert.equal(picker.hasDayClass(5, 'is_range_start'), true)
  await picker.clickDay(12)
  await picker.clickButton('انصراف')
  assert.equal(picker.hasDayClass(8, 'is_range_end'), true)
  await picker.setRange({ start: null, end: null })
  assert.equal(picker.button('تایید').props.disabled, true)
  assert.deepEqual(picker.rangeUpdates, [])
})

test('an inactive external model does not move the active calendar', async (t) => {
  const single = mountPicker()
  const range = mountPicker({ mode: 'range', range: { start: '1404/01/02', end: '1404/01/05' } })
  t.after(single.unmount)
  t.after(range.unmount)
  await single.setRange({ start: '1400/03/01', end: '1400/03/05' })
  await range.setDate('1400/03/01')
  assert.equal(single.title(), 'فروردین ۱۴۰۴')
  assert.equal(range.title(), 'فروردین ۱۴۰۴')
})

test('toggling actions discards the preview without publishing it', async (t) => {
  const picker = mountPicker()
  t.after(picker.unmount)
  await picker.clickDay(12)
  await picker.setProps({ showActions: false })
  assert.equal(picker.hasDayClass(10, 'day_selected'), true)
  assert.equal(picker.button('تایید'), undefined)
  assert.deepEqual(picker.dateUpdates, [])
  await picker.clickDay(13)
  await picker.setProps({ showActions: true })
  await picker.clickDay(14)
  await picker.clickButton('انصراف')
  assert.equal(picker.hasDayClass(13, 'day_selected'), true)
  assert.deepEqual(picker.dateUpdates, ['1404/01/13'])
})

test('changing modes discards previews and restores each committed model', async (t) => {
  const picker = mountPicker({ range: { start: '1404/02/02', end: '1404/02/05' } })
  t.after(picker.unmount)
  await picker.clickDay(12)
  await picker.setProps({ mode: 'range' })
  assert.equal(picker.title(), 'اردیبهشت ۱۴۰۴')
  assert.equal(picker.hasDayClass(2, 'is_range_start'), true)
  await picker.clickDay(8)
  await picker.setProps({ mode: 'single' })
  assert.equal(picker.title(), 'فروردین ۱۴۰۴')
  assert.equal(picker.hasDayClass(10, 'day_selected'), true)
  assert.deepEqual(picker.dateUpdates, [])
  assert.deepEqual(picker.rangeUpdates, [])
})

function freezeTime(t, instant) {
  const NativeDate = globalThis.Date
  let now = NativeDate.parse(instant)
  globalThis.Date = class extends NativeDate {
    constructor(...args) { super(...(args.length ? args : [now])) }
    static now() { return now }
  }
  t.after(() => { globalThis.Date = NativeDate })
  return (value) => { now = NativeDate.parse(value) }
}

test('now reads Tehran today at click time and waits for single confirmation', async (t) => {
  const setTime = freezeTime(t, '2025-03-20T20:29:59Z')
  const picker = mountPicker()
  t.after(picker.unmount)
  setTime('2025-03-20T20:30:01Z')
  await picker.clickButton('اکنون')
  assert.equal(picker.title(), 'فروردین ۱۴۰۴')
  assert.equal(picker.hasDayClass(1, 'day_selected'), true)
  assert.equal(picker.hasDayClass(1, 'current_day'), true)
  assert.deepEqual(picker.dateUpdates, [])
  await picker.clickButton('تایید')
  assert.deepEqual(picker.dateUpdates, ['1404/01/01'])
})

test('now starts a fresh range at today and requires an end', async (t) => {
  freezeTime(t, '2025-03-20T20:30:01Z')
  const picker = mountPicker({ mode: 'range', range: { start: '1404/01/02', end: '1404/01/05' } })
  t.after(picker.unmount)
  await picker.clickDay(10)
  await picker.clickButton('اکنون')
  assert.equal(picker.hasDayClass(1, 'is_range_start'), true)
  assert.equal(picker.button('تایید').props.disabled, true)
  assert.deepEqual(picker.rangeUpdates, [])
  await picker.clickDay(3)
  await picker.clickButton('تایید')
  assert.deepEqual(picker.rangeUpdates, [{ start: '1404/01/01', end: '1404/01/03' }])
})

test('disabled today cannot be selected through now in either mode', async (t) => {
  freezeTime(t, '2025-03-20T20:30:01Z') // Friday in Tehran: 1404/01/01.
  for (const mode of ['single', 'range']) {
    const picker = mountPicker({ mode, disable: 'Friday' })
    t.after(picker.unmount)
    assert.equal(picker.button('اکنون').props.disabled, true)
    await picker.clickButton('اکنون')
    assert.deepEqual(picker.dateUpdates, [])
    assert.deepEqual(picker.rangeUpdates, [])
    assert.equal(picker.hasDayClass(1, mode === 'single' ? 'day_selected' : 'is_range_start'), false)
  }
})

test('now becomes available after a disabled Friday rolls into Tehran Saturday', async (t) => {
  const setTime = freezeTime(t, '2025-03-21T20:29:59Z')
  const timers = new Map()
  let nextTimer = 0
  t.mock.method(globalThis, 'setTimeout', (callback, delay) => {
    const id = ++nextTimer
    timers.set(id, { callback, due: Date.now() + delay })
    return id
  })
  t.mock.method(globalThis, 'clearTimeout', (id) => { timers.delete(id) })
  const picker = mountPicker({ disable: 'Friday' })
  t.after(picker.unmount)
  assert.equal(picker.button('اکنون').props.disabled, true)
  setTime('2025-03-21T20:30:01Z')
  for (const [id, timer] of timers) {
    if (timer.due <= Date.now()) {
      timers.delete(id)
      timer.callback()
    }
  }
  await flushUpdates()
  assert.equal(picker.button('اکنون').props.disabled, false)
  await picker.clickButton('اکنون')
  await picker.clickButton('تایید')
  assert.deepEqual(picker.dateUpdates, ['1404/01/02'])
  picker.unmount()
  assert.equal(timers.size, 0, 'unmount cleans up the next midnight refresh')
})

test('confirm rechecks disabled endpoints even outside the displayed month', async (t) => {
  const picker = mountPicker({ mode: 'range' })
  t.after(picker.unmount)
  await picker.clickDay(1) // 1404/01/01: Friday.
  await picker.clickDay(3)
  await picker.setProps({ disable: 'Friday' })
  assert.equal(picker.button('تایید').props.disabled, true)
  const month = picker.nodes().find((node) => node.props.onClick && node.text === 'فروردین')
  await month.props.onClick()
  await nextTick()
  const ordibehesht = picker.nodes().find((node) => node.props.onClick && node.children[0]?.text === 'اردیبهشت')
  ordibehesht.props.onClick()
  await nextTick()
  await picker.clickButton('تایید')
  assert.deepEqual(picker.rangeUpdates, [])
})

test('a range spanning a disabled weekday remains confirmable', async (t) => {
  const picker = mountPicker({ mode: 'range', disable: 'Friday' })
  t.after(picker.unmount)
  await picker.clickDay(2)
  await picker.clickDay(9)
  await picker.clickButton('تایید')
  assert.deepEqual(picker.rangeUpdates, [{ start: '1404/01/02', end: '1404/01/09' }])
})

test('full-button slots receive actions and enforce confirmation guards', async (t) => {
  const scopes = {}
  const slots = Object.fromEntries(['confirm', 'cancel', 'now'].map((name) => [`${name}-button`, (scope) => {
    scopes[name] = scope
    return h('button', { type: 'button', onClick: scope.action }, `custom-${name}`)
  }]))
  const picker = mountPicker({ mode: 'range', slots })
  t.after(picker.unmount)
  assert.equal(picker.button('تایید'), undefined)
  assert.equal(scopes.confirm.disabled, true)
  assert.equal(scopes.cancel.disabled, false)
  await picker.clickButton('custom-confirm')
  assert.deepEqual(picker.rangeUpdates, [])
  await picker.clickDay(2)
  await picker.clickDay(3)
  assert.equal(scopes.confirm.disabled, false)
  await picker.clickButton('custom-confirm')
  assert.deepEqual(picker.rangeUpdates, [{ start: '1404/01/02', end: '1404/01/03' }])
  await picker.clickDay(5)
  await picker.clickButton('custom-cancel')
  assert.equal(picker.hasDayClass(2, 'is_range_start'), true)
  const staleAction = scopes.confirm.action
  await picker.setProps({ showActions: false })
  staleAction()
  await nextTick()
  assert.equal(picker.rangeUpdates.length, 1)
})

test('draft selection works across the Jalali leap-year boundary', async (t) => {
  const picker = mountPicker({ mode: 'range', range: { start: '1403/12/29', end: null } })
  t.after(picker.unmount)
  assert.ok(picker.cell(30), 'leap Esfand has day 30')
  await picker.clickDay(30)
  await picker.clickButton('تایید')
  assert.deepEqual(picker.rangeUpdates, [{ start: '1403/12/29', end: '1403/12/30' }])
  await picker.setRange({ start: '1404/12/29', end: null })
  assert.equal(picker.cell(30), undefined, 'non-leap Esfand has only 29 days')
})
