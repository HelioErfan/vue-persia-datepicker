import test from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { normalizeDate, normalizeConstraints, isDateDisabled } from '../src/components/dateConstraints.js'

test('normalizes only canonical, real Jalali dates including leap days', () => {
    for (const value of ['1403/12/30', '1404/01/01', '1404/06/31', '1404/07/30']) {
        assert.equal(normalizeDate(value), value)
    }
    for (const value of [null, undefined, '', '1404/12/30', '1404/13/01', '1404/07/31',
        '1404/00/01', '1404/01/00', '1404-01-01', '1404/1/01', '1404/01/1',
        '۱۴۰۴/۰۱/۰۱', ' 1404/01/01', '1404/01/01x', '9999/01/01', 14040101, {}]) {
        assert.equal(normalizeDate(value), null, String(value))
    }
})

test('Date instants use the Tehran date on either side of midnight', () => {
    const before = new Date('2025-03-20T20:29:59Z')
    const after = new Date('2025-03-20T20:30:00Z')
    const timestamp = before.getTime()
    assert.equal(normalizeDate(before), '1403/12/30')
    assert.equal(normalizeDate(after), '1404/01/01')
    assert.equal(before.getTime(), timestamp)
    assert.equal(normalizeDate(new Date(NaN)), null)
    assert.equal(normalizeDate(new Date(8640000000000000)), null)
})

test('Tehran dates and weekdays are valid even when the host skipped that civil day', () => {
    // Samoa skipped December 30, 2011. That day still exists in Tehran.
    const moduleUrl = new URL('../src/components/dateConstraints.js', import.meta.url).href
    const script = `
        import assert from 'node:assert/strict';
        import { normalizeDate, normalizeConstraints, isDateDisabled } from ${JSON.stringify(moduleUrl)};
        assert.equal(normalizeDate('1390/10/09'), '1390/10/09');
        assert.equal(normalizeDate(new Date('2011-12-30T08:00:00Z')), '1390/10/09');
        assert.equal(isDateDisabled('1390/10/09', normalizeConstraints()), false);
        assert.equal(isDateDisabled('1390/10/09', normalizeConstraints({ disable: 'Friday' })), true);
        assert.equal(isDateDisabled('1390/10/09', normalizeConstraints({ disable: 'Saturday' })), false);
        assert.equal(isDateDisabled('1390/10/08', normalizeConstraints({ min: '1390/10/09' })), true);
        assert.equal(isDateDisabled('1390/10/09', normalizeConstraints({ disabledDates: '1390/10/09' })), true);
    `
    const result = spawnSync(process.execPath, ['--input-type=module', '-e', script], {
        env: { ...process.env, TZ: 'Pacific/Apia' }, encoding: 'utf8',
    })
    assert.equal(result.status, 0, result.stderr || String(result.error))
})

test('unrestricted rules allow real dates and reject missing or invalid candidates', () => {
    for (const rules of [normalizeConstraints(), normalizeConstraints({ disabledDates: null }), normalizeConstraints({ disabledDates: undefined })]) {
        assert.equal(isDateDisabled('1404/01/01', rules), false)
        assert.equal(isDateDisabled(null, rules), true)
        assert.equal(isDateDisabled('1404/12/30', rules), true)
    }
})

test('minimum and maximum are inclusive allowed boundaries', () => {
    const rules = normalizeConstraints({ min: '1404/01/02', max: '1404/01/04' })
    assert.equal(rules.min, '1404/01/02')
    assert.equal(rules.max, '1404/01/04')
    assert.equal(isDateDisabled('1404/01/01', rules), true)
    assert.equal(isDateDisabled('1404/01/02', rules), false)
    assert.equal(isDateDisabled('1404/01/03', rules), false)
    assert.equal(isDateDisabled('1404/01/04', rules), false)
    assert.equal(isDateDisabled('1404/01/05', rules), true)
})

test('equal boundaries allow one day and inverted boundaries allow none', () => {
    const equal = normalizeConstraints({ min: '1404/01/02', max: '1404/01/02' })
    assert.equal(isDateDisabled('1404/01/02', equal), false)
    assert.equal(isDateDisabled('1404/01/01', equal), true)
    assert.equal(isDateDisabled('1404/01/03', equal), true)
    const inverted = normalizeConstraints({ min: '1404/01/03', max: '1404/01/01' })
    for (const candidate of ['1404/01/01', '1404/01/02', '1404/01/03']) {
        assert.equal(isDateDisabled(candidate, inverted), true)
    }
})

test('invalid bounds are ignored independently of valid neighbors', () => {
    const rules = normalizeConstraints({ min: '1404/12/30', max: '1404/01/03' })
    assert.equal(rules.min, null)
    assert.equal(isDateDisabled('1403/12/30', rules), false)
    assert.equal(isDateDisabled('1404/01/04', rules), true)
    const minimumOnly = normalizeConstraints({ min: '1404/01/02', max: new Date(NaN) })
    assert.equal(minimumOnly.max, null)
    assert.equal(isDateDisabled('1404/01/01', minimumOnly), true)
    assert.equal(isDateDisabled('1404/01/03', minimumOnly), false)
})

test('single string and Date disabled rules identify the same day', () => {
    for (const value of ['1404/01/01', new Date('2025-03-20T20:30:00Z')]) {
        const rules = normalizeConstraints({ disabledDates: value })
        assert.deepEqual([...rules.dates], ['1404/01/01'])
        assert.equal(isDateDisabled('1404/01/01', rules), true)
        assert.equal(isDateDisabled(new Date('2025-03-21T12:00:00Z'), rules), true)
        assert.equal(isDateDisabled('1404/01/02', rules), false)
    }
})

test('disabled intervals include endpoints and normalize reversed endpoints', () => {
    for (const interval of [
        { start: '1403/12/30', end: '1404/01/02' },
        { start: '1404/01/02', end: '1403/12/30' },
        { start: new Date('2025-03-20T20:29:59Z'), end: '1404/01/02' },
    ]) {
        const rules = normalizeConstraints({ disabledDates: interval })
        assert.deepEqual(rules.intervals, [{ start: '1403/12/30', end: '1404/01/02' }])
        for (const candidate of ['1403/12/30', '1404/01/01', '1404/01/02']) {
            assert.equal(isDateDisabled(candidate, rules), true)
        }
        assert.equal(isDateDisabled('1403/12/29', rules), false)
        assert.equal(isDateDisabled('1404/01/03', rules), false)
    }
})

test('equal disabled interval endpoints disable just that date', () => {
    const rules = normalizeConstraints({ disabledDates: { start: '1404/01/02', end: '1404/01/02' } })
    assert.equal(isDateDisabled('1404/01/01', rules), false)
    assert.equal(isDateDisabled('1404/01/02', rules), true)
    assert.equal(isDateDisabled('1404/01/03', rules), false)
})

test('partial and invalid intervals are ignored wholly', () => {
    for (const interval of [{ start: '1404/01/01' }, { end: '1404/01/01' },
        { start: null, end: '1404/01/01' }, { start: '1404/01/01', end: '1404/12/30' },
        { start: new Date(NaN), end: '1404/01/01' }, {}]) {
        const rules = normalizeConstraints({ disabledDates: interval })
        assert.deepEqual(rules.intervals, [])
        assert.equal(isDateDisabled('1404/01/01', rules), false)
    }
})

test('mixed frozen arrays preserve valid rules beside invalid rules and overlapping intervals', () => {
    const firstInterval = Object.freeze({ start: '1404/01/05', end: '1404/01/03' })
    const secondInterval = Object.freeze({ start: '1404/01/04', end: '1404/01/07' })
    const values = Object.freeze(['1404/01/01', null, '1404/12/30', firstInterval,
        { start: '1404/01/02' }, new Date(NaN), secondInterval, '1404/01/09'])
    const snapshot = [...values]
    const rules = normalizeConstraints({ disabledDates: values })
    for (const candidate of ['1404/01/01', '1404/01/03', '1404/01/04', '1404/01/05', '1404/01/06', '1404/01/07', '1404/01/09']) {
        assert.equal(isDateDisabled(candidate, rules), true, candidate)
    }
    for (const candidate of ['1404/01/02', '1404/01/08', '1404/01/10']) {
        assert.equal(isDateDisabled(candidate, rules), false, candidate)
    }
    assert.deepEqual(values, snapshot)
    assert.equal(firstInterval.start, '1404/01/05')
})

test('Date bounds are equivalent to string bounds', () => {
    const rules = normalizeConstraints({ min: new Date('2025-03-20T20:30:00Z'), max: new Date('2025-03-21T20:30:00Z') })
    assert.equal(rules.min, '1404/01/01')
    assert.equal(rules.max, '1404/01/02')
    assert.equal(isDateDisabled('1403/12/30', rules), true)
    assert.equal(isDateDisabled('1404/01/01', rules), false)
    assert.equal(isDateDisabled('1404/01/02', rules), false)
    assert.equal(isDateDisabled('1404/01/03', rules), true)
})

test('weekday names are case insensitive with Saturday indexed as zero', () => {
    const rules = normalizeConstraints({ disable: [' SATURDAY ', 'fRiDaY', 'invalid', null] })
    assert.deepEqual([...rules.weekdays], [0, 6])
    assert.equal(isDateDisabled('1404/01/01', rules), true) // Friday
    assert.equal(isDateDisabled('1404/01/02', rules), true) // Saturday
    assert.equal(isDateDisabled('1404/01/03', rules), false)
    assert.equal(isDateDisabled('1404/01/03', normalizeConstraints({ disable: 'SUNDAY' })), true)
})

test('weekday, bounds, single dates and intervals combine as exclusions', () => {
    const rules = normalizeConstraints({ min: '1404/01/01', max: '1404/01/10', disable: 'Friday',
        disabledDates: ['1404/01/03', { start: '1404/01/05', end: '1404/01/06' }] })
    for (const candidate of ['1403/12/30', '1404/01/01', '1404/01/03', '1404/01/05', '1404/01/06', '1404/01/08', '1404/01/11']) {
        assert.equal(isDateDisabled(candidate, rules), true, candidate)
    }
    for (const candidate of ['1404/01/02', '1404/01/04', '1404/01/07', '1404/01/09', '1404/01/10']) {
        assert.equal(isDateDisabled(candidate, rules), false, candidate)
    }
})
