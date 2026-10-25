import assert from 'node:assert/strict'
import test from 'node:test'
import { h, nextTick, ref } from 'vue'
import { DatePicker } from '../dist/index.esm.js'
import { createNode, descendants, installTransitionEnvironment, renderer } from './helpers/renderer.js'

test.before(installTransitionEnvironment)

async function flush() {
  await nextTick()
  await nextTick()
  await nextTick()
}

function mountPicker(t, { date = '1404/01/10', range = { start: null, end: null }, slots, ...props } = {}) {
  const root = createNode('root')
  const inputs = ref(props)
  const dateValue = ref(date)
  const rangeValue = ref(range)
  const updates = []
  const app = renderer.createApp({
    render: () => h(DatePicker, {
      ...inputs.value, date: dateValue.value, range: rangeValue.value,
      'onUpdate:date': (value) => { updates.push(value); dateValue.value = value },
      'onUpdate:range': (value) => { updates.push(value); rangeValue.value = value },
    }, slots),
  })
  app.mount(root)
  t.after(() => app.unmount())
  const nodes = () => descendants(root)
  const hasClass = (node, value) => node?.props.class?.split(/\s+/).includes(value)
  const cell = (day) => nodes().find((node) => hasClass(node, 'vue-persia-datepicker__calendar_day') && node.children[0]?.text === String(day))
  const button = (text) => nodes().find((node) => node.type === 'button' && node.text === text)
  const click = async (node) => { assert.ok(node, 'interactive element exists'); node.props.onClick(); await flush() }
  return {
    inputs, dateValue, rangeValue, updates, cell, button,
    disabled: (day) => cell(day).props['aria-disabled'],
    selected: (day, suffix = 'day_selected') => hasClass(cell(day), `vue-persia-datepicker__calendar_${suffix}`),
    clickDay: (day) => click(cell(day)),
    clickButton: (text) => click(button(text)),
    setProps: async (value) => { inputs.value = { ...inputs.value, ...value }; await flush() },
    setDate: async (value) => { dateValue.value = value; await flush() },
    setRange: async (value) => { rangeValue.value = value; await flush() },
    selectMonth: async (name) => {
      const title = nodes().find((node) => hasClass(node, 'vue-persia-datepicker__header__month_year'))
      await click(title.children[0])
      await click(nodes().find((node) => hasClass(node, 'vue-persia-datepicker__calendar_month_item') && node.children[0]?.text === name))
    },
  }
}

for (const mode of ['single', 'range']) {
  for (const showActions of [false, true]) {
    test(`${mode}, actions=${showActions}: all rules block selection and bounds remain inclusive`, async (t) => {
      const picker = mountPicker(t, {
        mode, showActions, date: '1404/01/04', min: '1404/01/02', max: '1404/01/10', disable: 'Friday',
        disabledDates: ['1404/01/03', { start: '1404/01/05', end: '1404/01/06' }],
      })
      for (const day of [1, 3, 5, 6, 8, 11]) {
        assert.equal(picker.disabled(day), true, `day ${day} is disabled`)
        assert.match(picker.cell(day).props.class, /calendar_day_disabled/)
        await picker.clickDay(day)
      }
      assert.deepEqual(picker.updates, [])
      assert.equal(picker.disabled(2), false)
      assert.equal(picker.disabled(10), false)
      await picker.clickDay(10)
      if (mode === 'range') await picker.clickDay(2)
      if (showActions) {
        assert.deepEqual(picker.updates, [])
        await picker.clickButton('تایید')
      }
      assert.deepEqual(picker.updates.at(-1), mode === 'single' ? '1404/01/10' : { start: '1404/01/02', end: '1404/01/10' })
    })
  }
}

test('Date bounds and mixed custom intervals use Tehran days without changing model output', async (t) => {
  const picker = mountPicker(t, {
    min: new Date('2025-03-20T20:30:00Z'), max: new Date('2025-03-25T12:00:00Z'),
    disabledDates: [new Date('2025-03-21T12:00:00Z'), { start: new Date('2025-03-22T12:00:00Z'), end: '1404/01/03' }],
  })
  for (const day of [1, 2, 3, 6]) assert.equal(picker.disabled(day), true)
  await picker.clickDay(4)
  assert.deepEqual(picker.updates, ['1404/01/04'])
})

test('single dates, top-level Date, and bounded intervals can replace each other reactively', async (t) => {
  const picker = mountPicker(t, { disabledDates: '1404/01/02' })
  assert.equal(picker.disabled(2), true)
  await picker.setProps({ disabledDates: new Date('2025-03-23T12:00:00Z') })
  assert.equal(picker.disabled(2), false)
  assert.equal(picker.disabled(3), true)
  await picker.setProps({ disabledDates: { start: '1404/01/06', end: '1404/01/04' } })
  for (const day of [4, 5, 6]) assert.equal(picker.disabled(day), true)
  assert.equal(picker.disabled(3), false)
  await picker.setProps({ disabledDates: null })
  assert.equal(picker.disabled(5), false)
})

test('nested array and interval edits update cells and confirmation without publishing', async (t) => {
  const picker = mountPicker(t, { showActions: true, disabledDates: [{ start: '1404/01/02', end: '1404/01/03' }] })
  await picker.clickDay(12)
  picker.inputs.value.disabledDates.push('1404/01/12')
  await flush()
  assert.equal(picker.disabled(12), true)
  assert.equal(picker.selected(12), true)
  assert.equal(picker.button('تایید').props.disabled, true)
  picker.inputs.value.disabledDates[0].end = '1404/01/05'
  await flush()
  assert.equal(picker.disabled(5), true)
  await picker.clickButton('تایید')
  assert.deepEqual(picker.updates, [])
  assert.equal(picker.dateValue.value, '1404/01/10')
  await picker.clickButton('انصراف')
  assert.equal(picker.selected(10), true)
  await picker.setProps({ min: '1404/01/11' })
  assert.equal(picker.selected(10), true)
  assert.equal(picker.button('تایید').props.disabled, true)
  assert.deepEqual(picker.updates, [])
})

for (const showActions of [false, true]) {
  test(`actions=${showActions}: invalidated partial range restarts instead of emitting a stale endpoint`, async (t) => {
    const picker = mountPicker(t, { mode: 'range', showActions })
    await picker.clickDay(2)
    await picker.setProps({ disabledDates: '1404/01/02' })
    const previousCount = picker.updates.length
    await picker.clickDay(4)
    assert.equal(picker.selected(4, 'is_range_start'), true)
    assert.equal(picker.selected(2, 'is_range_start'), false)
    if (showActions) {
      assert.equal(picker.button('تایید').props.disabled, true)
      assert.equal(picker.updates.length, previousCount)
      await picker.clickDay(6)
      await picker.clickButton('تایید')
      assert.deepEqual(picker.updates, [{ start: '1404/01/04', end: '1404/01/06' }])
    } else {
      assert.deepEqual(picker.updates.at(-1), { start: '1404/01/04', end: null })
    }
  })
}

test('range confirmation checks endpoints outside the displayed month and cancel preserves the parent', async (t) => {
  const saved = { start: '1404/01/02', end: '1404/01/05' }
  const picker = mountPicker(t, { mode: 'range', showActions: true, range: saved })
  await picker.selectMonth('اردیبهشت')
  await picker.setProps({ max: '1404/01/04' })
  assert.equal(picker.button('تایید').props.disabled, true)
  await picker.clickButton('تایید')
  await picker.clickButton('انصراف')
  assert.deepEqual(picker.rangeValue.value, saved)
  assert.equal(picker.selected(5, 'is_range_end'), true)
  assert.equal(picker.disabled(5), true)
  assert.deepEqual(picker.updates, [])
})

test('a blocked interval can be crossed across months, and one-day ranges remain valid', async (t) => {
  const picker = mountPicker(t, {
    mode: 'range', showActions: true, range: { start: '1404/01/30', end: null },
    disabledDates: { start: '1404/01/31', end: '1404/02/02' },
  })
  await picker.selectMonth('اردیبهشت')
  await picker.clickDay(3)
  await picker.clickButton('تایید')
  assert.deepEqual(picker.updates, [{ start: '1404/01/30', end: '1404/02/03' }])
  await picker.selectMonth('اردیبهشت')
  await picker.clickDay(4)
  await picker.clickDay(4)
  await picker.clickButton('تایید')
  assert.deepEqual(picker.updates.at(-1), { start: '1404/02/04', end: '1404/02/04' })
})

test('leap-year and year-boundary rules do not roll invalid dates into a valid day', async (t) => {
  const picker = mountPicker(t, { date: '1403/12/29', disabledDates: '1403/12/30', max: '1404/01/02' })
  assert.equal(picker.disabled(30), true)
  await picker.setDate('1404/01/01')
  assert.equal(picker.disabled(1), false)
  assert.equal(picker.disabled(2), false)
  assert.equal(picker.disabled(3), true)
  await picker.setProps({ max: null, disabledDates: ['1404/12/30', { start: '1404/13/01', end: '1405/01/05' }] })
  await picker.setDate('1405/01/01')
  assert.equal(picker.disabled(1), false)
  assert.equal(picker.disabled(2), false)
})

test('custom slot actions recheck newly blocked selections and today in both modes', async (t) => {
  const NativeDate = globalThis.Date
  globalThis.Date = class extends NativeDate {
    constructor(...args) { super(...(args.length ? args : ['2025-03-21T12:00:00Z'])) }
    static now() { return NativeDate.parse('2025-03-21T12:00:00Z') }
  }
  t.after(() => { globalThis.Date = NativeDate })
  for (const mode of ['single', 'range']) {
    const scopes = {}
    const slots = Object.fromEntries(['confirm', 'now'].map((name) => [`${name}-button`, (scope) => {
      scopes[name] = scope
      return h('button', { onClick: scope.action }, name)
    }]))
    const picker = mountPicker(t, { mode, showActions: true, slots })
    await picker.clickDay(4)
    if (mode === 'range') await picker.clickDay(6)
    const staleConfirm = scopes.confirm.action
    for (const rules of [
      { min: '1404/01/05' },
      { min: null, max: '1403/12/30' },
      { max: null, disabledDates: ['1404/01/01', '1404/01/04'] },
      { disabledDates: { start: '1404/01/01', end: '1404/01/04' } },
    ]) {
      await picker.setProps(rules)
      assert.equal(scopes.now.disabled, true)
      assert.equal(scopes.confirm.disabled, true)
      staleConfirm()
      await picker.clickButton('now')
      await flush()
      assert.deepEqual(picker.updates, [])
      assert.equal(picker.selected(1, mode === 'single' ? 'day_selected' : 'is_range_start'), false)
    }
    await picker.setProps({ min: null, max: null, disabledDates: [] })
    assert.equal(scopes.now.disabled, false)
    await picker.clickButton('now')
    assert.equal(picker.selected(1, mode === 'single' ? 'day_selected' : 'is_range_start'), true)
    if (mode === 'range') await picker.clickDay(2)
    await picker.clickButton('confirm')
    assert.deepEqual(picker.updates, [mode === 'single' ? '1404/01/01' : { start: '1404/01/01', end: '1404/01/02' }])
  }
})

test('a stale day callback cannot bypass changed constraints in the parent', async (t) => {
  const picker = mountPicker(t)
  const staleClick = picker.cell(4).props.onClick
  await picker.setProps({ min: '1404/01/05' })
  staleClick()
  await flush()
  assert.deepEqual(picker.updates, [])
})

test('inverted bounds disable the calendar and retain externally supplied values', async (t) => {
  const picker = mountPicker(t, { showActions: true, min: '1404/01/20', max: '1404/01/05' })
  for (const day of [1, 5, 10, 20, 31]) assert.equal(picker.disabled(day), true)
  assert.equal(picker.button('تایید').props.disabled, true)
  await picker.setDate('1404/01/12')
  assert.equal(picker.selected(12), true)
  assert.deepEqual(picker.updates, [])
})
