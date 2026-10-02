import assert from 'node:assert/strict'
import test from 'node:test'
import { createSSRApp } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { DatePicker } from '../dist/index.esm.js'

function selectedDays(html) {
  return [...html.matchAll(/<div class="([^"]*)"[^>]*>\s*<span>([^<]*)<\/span>/g)]
    .filter(([, classes]) => classes.split(/\s+/).includes('vue-persia-datepicker__calendar_day_selected'))
    .map(([, , day]) => day)
}

function displayedMonth(html) {
  const title = html.match(/<strong class="vue-persia-datepicker__header__month_year">([\s\S]*?)<\/strong>/)?.[1]
  return title?.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

test('an incoming single date is highlighted in the calendar', async () => {
  const html = await renderToString(createSSRApp(DatePicker, {
    mode: 'single',
    date: '1404/01/10',
  }))

  assert.deepEqual(selectedDays(html), ['10'])
})

test('defaultDate initializes the selected day and displayed month', async () => {
  const html = await renderToString(createSSRApp(DatePicker, {
    mode: 'single',
    defaultDate: '1400/01/01',
  }))

  assert.equal(displayedMonth(html), 'فروردین ۱۴۰۰')
  assert.deepEqual(selectedDays(html), ['1'])
})

test('a supplied date model takes precedence over defaultDate', async () => {
  const html = await renderToString(createSSRApp(DatePicker, {
    mode: 'single',
    date: '1404/01/10',
    defaultDate: '1400/01/01',
  }))

  assert.equal(displayedMonth(html), 'فروردین ۱۴۰۴')
  assert.deepEqual(selectedDays(html), ['10'])
})
