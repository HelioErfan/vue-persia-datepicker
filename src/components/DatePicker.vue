<script setup>
import { ref, computed, watch, provide, getCurrentInstance, onMounted, onUnmounted } from 'vue'
import { JalaliDateTime } from '@webilix/jalali-date-time';
import moment from 'moment-jalaali';
import CalendarHeader from './CalendarHeader.vue'
import CalendarDays from './CalendarDays.vue';
import MonthSelector from './MonthSelector.vue'
import YearSelector from './YearSelector.vue';

const dateModel = defineModel('date',{ type: String, default: null })
const rangeModel = defineModel('range', { type: Object, default: () => ({ start: null, end: null }) })

const props = defineProps({
    defaultDate: String,
    showActions: {
        type: Boolean,
        default: false
    },
    disable: {
        type: [String, Array],
        default: () => []
    },
    mode: {
        type: String,
        default: 'single',
        validator: (value) => ['single', 'range'].includes(value)
    },
    defaultRange: {
        type: Object,
        default: () => ({ start: null, end: null })
    }
})

const config = {
    timezone: 'Asia/Tehran',
    locale: 'en',
    fullTextFormat: 'W, D N Y H:I:s',
    titleFormat: 'W, D N Y',
    dateFormat: 'Y/M/D',
    timeFormat: 'H:I:s'
}

const jalali = JalaliDateTime(config)

const viewMode = ref('days')
const readToday = () => jalali.now({ timezone: config.timezone, locale: config.locale, format: config.dateFormat })
const currentDate = ref(readToday())
const yearMonthOf = (date) => (date || currentDate.value).split('/').slice(0, 2).join('-')
const copyRange = (value) => ({ start: value?.start ?? null, end: value?.end ?? null })

const committedDate = ref(dateModel.value ?? props.defaultDate ?? null)
const initialRange = getCurrentInstance().vnode.props?.range ?? props.defaultRange
const committedRange = ref(copyRange(initialRange))
const selectedDate = ref(committedDate.value)
const range = ref(copyRange(committedRange.value))
const currentYearMonth = ref(yearMonthOf(props.mode === 'range' && range.value.start ? range.value.start : selectedDate.value))

const calendar = computed(() => jalali.calendar(currentYearMonth.value))

const weekdayNames = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday']
const disabledWeekdays = computed(() => {
    const names = Array.isArray(props.disable) ? props.disable : [props.disable]
    return new Set(names.map((name) =>
        typeof name === 'string' ? weekdayNames.indexOf(name.trim().toLowerCase()) : -1
    ))
})

const dateHeaderTitle = computed(() => calendar.value.title.split(' '))

const mode = computed(() => props.mode)
provide('mode', mode)

const restoreSelection = () => {
    selectedDate.value = committedDate.value
    range.value = copyRange(committedRange.value)
    currentDate.value = readToday()
    currentYearMonth.value = yearMonthOf(props.mode === 'single' ? selectedDate.value : range.value.start)
    viewMode.value = 'days'
}

watch(() => dateModel.value, (newDate) => {
    committedDate.value = newDate ?? null
    selectedDate.value = committedDate.value
    if (!props.showActions || props.mode === 'single') {
        currentDate.value = readToday()
        currentYearMonth.value = yearMonthOf(selectedDate.value)
    }
})

watch(
    () => [rangeModel.value?.start, rangeModel.value?.end],
    ([start, end]) => {
        const previousStart = range.value.start;
        committedRange.value = copyRange({ start, end })
        range.value = copyRange(committedRange.value)
        if (props.mode === 'range' && (props.showActions || (start && start !== previousStart))) {
            currentDate.value = readToday()
            currentYearMonth.value = yearMonthOf(start)
        }
    }
)

const isDateDisabled = (date) => {
    if (!date || disabledWeekdays.value.size === 0) return false
    const weekday = moment(date, 'jYYYY/jMM/jDD').day()
    return disabledWeekdays.value.has((weekday + 1) % 7)
}

const canConfirm = computed(() => {
    if (props.mode === 'single') return !!selectedDate.value && !isDateDisabled(selectedDate.value)
    const { start, end } = range.value
    return !!start && !!end && start <= end && !isDateDisabled(start) && !isDateDisabled(end)
})

const nowDisabled = computed(() => isDateDisabled(currentDate.value))

let todayRefreshTimer
const scheduleTodayRefresh = () => {
    clearTimeout(todayRefreshTimer)
    if (!props.showActions) return
    const now = new Date()
    const midnight = jalali.periodDay(1, now, config.timezone).to.getTime() + 1
    todayRefreshTimer = setTimeout(() => {
        currentDate.value = readToday()
        scheduleTodayRefresh()
    }, midnight - now.getTime())
}

onMounted(scheduleTodayRefresh)
onUnmounted(() => clearTimeout(todayRefreshTimer))

const commitSelection = () => {
    if (props.mode === 'single') {
        committedDate.value = selectedDate.value
        dateModel.value = selectedDate.value
    } else {
        committedRange.value = copyRange(range.value)
        rangeModel.value = copyRange(range.value)
    }
}

const confirmSelection = () => {
    if (!props.showActions || !canConfirm.value) return
    commitSelection()
}

const cancelSelection = () => {
    if (!props.showActions) return
    restoreSelection()
}

const selectNow = () => {
    if (!props.showActions) return
    currentDate.value = readToday()
    if (isDateDisabled(currentDate.value)) return
    if (props.mode === 'single') selectedDate.value = currentDate.value
    else range.value = { start: currentDate.value, end: null }
    currentYearMonth.value = yearMonthOf(currentDate.value)
    viewMode.value = 'days'
}

const updateCalendar = (direction) => {
    const [year, month] = currentYearMonth.value.split('-').map(Number);
    let newMonth = direction === 'next' ? month + 1 : month - 1;
    let newYear = year;

    if (newMonth > 12) {
        newMonth = 1;
        newYear += 1;
    } else if (newMonth < 1) {
        newMonth = 12;
        newYear -= 1;
    }
    currentYearMonth.value = `${newYear}-${newMonth.toString().padStart(2, '0')}`;
}

const calendarDays = computed( () => {
    const [year, month] = currentYearMonth.value.split('-').map(Number);
    const daysInMonth = jalali.daysInMonth(currentYearMonth.value);
    const firstdayOfEachMonth = `${year}-${month}-01`;
    const miladDate = moment(firstdayOfEachMonth,'jYYYY/jMM/jDD').toDate();
    const firstDayOfWeek = jalali.dayOfWeek(miladDate);
    const days = [];

    // Add empty days at the start
    for(let i = 0; i < firstDayOfWeek; i++) {
        days.push({day: '', date: `empty-start-${i}`});
    }

    // Add actual days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        days.push({
            day,
            date: dateStr,
            disabled: disabledWeekdays.value.has((firstDayOfWeek + day - 1) % 7)
        })
    }

    // Add empty days at the end to complete last week
    while (days.length % 7 !== 0) {
        days.push({day: '', date: `empty-end-${days.length}`});
    }
    return days;
});

const onSelectDay = (day) => {

    if (!day || calendarDays.value.some((calendarDay) => calendarDay.date === day && calendarDay.disabled)) return

    const [year, month] = currentYearMonth.value.split('-');
    const formatted = `${year}/${month.padStart(2, '0')}/${day.split('-')[2].padStart(2, '0')}`;

    if (props.mode === 'single') {
        selectedDate.value = formatted;
    } else {
        if (!range.value.start || (range.value.start && range.value.end)) {
            range.value = { start: formatted, end: null };
        } else if (!range.value.end) {
            if (formatted < range.value.start) {
                range.value = { start: formatted, end: range.value.start };
            } else {
                range.value = { start: range.value.start, end: formatted };
            }
        }
    }
    if (!props.showActions) commitSelection()
}

watch(
    () => props.mode,
    (mode) => {
        if (props.showActions) {
            restoreSelection()
            return
        }
        if(mode === 'single') {
            range.value = { start: null, end: null }
        } else {
            selectedDate.value = null
        }
    }
)

watch(() => props.showActions, () => {
    restoreSelection()
    scheduleTodayRefresh()
})

const handleMonthSelected = (month) => {
    const [year] = currentYearMonth.value.split('-');
    currentYearMonth.value = `${year}-${month}`;
    viewMode.value = 'days';
}

const handleYearSelected = (year) => {
    const [,month] = currentYearMonth.value.split('-');
    currentYearMonth.value = `${year}-${month}`;
    viewMode.value = 'months';
}

const handleViewSelected = (value, type) => {
    if (type === 'month') {
        const [year] = currentYearMonth.value.split('-');
        currentYearMonth.value = `${year}-${value}`;
        viewMode.value = 'days';
    } else if (type === 'year') {
        const [, month] = currentYearMonth.value.split('-');
        currentYearMonth.value`${value}-${month}`;
        viewMode.value = 'days';
    }
}

const toggleView = (view) => {
    viewMode.value = view;
}
</script>

<template>
    <div class="vue-persia-datepicker__container">
        <div>
            <CalendarHeader 
                :calendarTitle="dateHeaderTitle"
                :viewMode="viewMode" 
                @prev-month="updateCalendar('prev')"
                @next-month="updateCalendar('next')" 
                @toggle-view="toggleView"
            />
        </div>
        <div v-show="viewMode === 'days'">
            <CalendarDays
                :calendar-days="calendarDays"
                :selected-date="selectedDate"
                :range="range"
                :current-day="currentDate"
                @selected-day="onSelectDay"
                @selected-range="onSelectDay"
            />
        </div>
        <div v-show="viewMode === 'months'">
            <MonthSelector
                :current-year-month="currentYearMonth"
                :current-month="currentDate"
                :view-selected="handleViewSelected"
                @month-selected="handleMonthSelected"
            />
        </div>
        <div v-show="viewMode === 'years'">
            <YearSelector
                :current-year-month="currentYearMonth"
                :current-year="currentDate"
                @year-selected="handleYearSelected"
            />
        </div>
        <div v-if="showActions" class="vue-persia-datepicker__actions">
            <div class="vue-persia-datepicker__action">
                <slot name="confirm-button" :action="confirmSelection" :disabled="!canConfirm">
                    <button
                        type="button"
                        class="vue-persia-datepicker__action-button vue-persia-datepicker__action-button--confirm"
                        :disabled="!canConfirm"
                        @click="confirmSelection"
                    >تایید</button>
                </slot>
            </div>
            <div class="vue-persia-datepicker__action">
                <slot name="cancel-button" :action="cancelSelection" :disabled="false">
                    <button type="button" class="vue-persia-datepicker__action-button" @click="cancelSelection">انصراف</button>
                </slot>
            </div>
            <div class="vue-persia-datepicker__action">
                <slot name="now-button" :action="selectNow" :disabled="nowDisabled">
                    <button
                        type="button"
                        class="vue-persia-datepicker__action-button"
                        :disabled="nowDisabled"
                        @click="selectNow"
                    >اکنون</button>
                </slot>
            </div>
        </div>
    </div>
</template>

<style src="./styles/calendar.css"></style>
