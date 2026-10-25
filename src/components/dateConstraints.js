import { JalaliDateTime } from '@webilix/jalali-date-time'
import moment from 'moment-jalaali'

const dateConfig = { timezone: 'Asia/Tehran', locale: 'en', format: 'Y/M/D' }
const jalali = JalaliDateTime()
const dateFormat = 'jYYYY/jMM/jDD'
const weekdayNames = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday']

export const normalizeDate = (value) => {
    try {
        if (value instanceof Date) {
            if (!Number.isFinite(value.getTime())) return null
            value = jalali.toString(value, dateConfig)
        }
        if (typeof value !== 'string' || !/^\d{4}\/\d{2}\/\d{2}$/.test(value)) return null

        const [year, month, day] = value.split('/').map(Number)
        // Validate the year even for months whose lengths do not depend on leap years.
        moment.jIsLeapYear(year)
        if (month < 1 || month > 12 || day < 1 || day > moment.jDaysInMonth(year, month - 1)) return null

        // Civil-date validation must not depend on the host's timezone history.
        const parsed = moment.utc(value, dateFormat, 'en', true)
        return parsed.isValid() && parsed.format(dateFormat) === value ? value : null
    } catch {
        // Date conversion and the Jalali engine can reject out-of-range years.
        return null
    }
}

export const normalizeConstraints = ({ min, max, disabledDates, disable } = {}) => {
    const constraints = {
        min: normalizeDate(min),
        max: normalizeDate(max),
        dates: new Set(),
        intervals: [],
        weekdays: new Set(),
    }

    const rules = Array.isArray(disabledDates) ? disabledDates : [disabledDates]
    for (const rule of rules) {
        const date = normalizeDate(rule)
        if (date) {
            constraints.dates.add(date)
        } else if (rule && typeof rule === 'object' && !(rule instanceof Date) && !Array.isArray(rule)) {
            const start = normalizeDate(rule.start)
            const end = normalizeDate(rule.end)
            if (start && end) {
                constraints.intervals.push(start <= end ? { start, end } : { start: end, end: start })
            }
        }
    }

    const weekdays = Array.isArray(disable) ? disable : [disable]
    for (const name of weekdays) {
        const index = typeof name === 'string' ? weekdayNames.indexOf(name.trim().toLowerCase()) : -1
        if (index !== -1) constraints.weekdays.add(index)
    }

    return constraints
}

export const isDateDisabled = (value, constraints) => {
    const date = normalizeDate(value)
    if (!date) return true
    if (constraints.min && date < constraints.min) return true
    if (constraints.max && date > constraints.max) return true
    if (constraints.dates.has(date)) return true
    if (constraints.intervals.some(({ start, end }) => start <= date && date <= end)) return true

    const weekday = moment.utc(date, dateFormat, 'en', true).day()
    return constraints.weekdays.has((weekday + 1) % 7)
}
