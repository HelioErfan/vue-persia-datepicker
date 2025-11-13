<script setup>
import { ref, computed, watch, provide } from 'vue'
import { JalaliDateTime } from '@webilix/jalali-date-time';
import moment from 'moment-jalaali';
import CalendarHeader from './CalendarHeader.vue'
import CalendarDays from './CalendarDays.vue';
import MonthSelector from './MonthSelector.vue'
import YearSelector from './YearSelector.vue';

const dateModel = defineModel('date',{ type: String, default: null })
const rangeModel = defineModel('range', { type: Object, default: { start: null, end: null } })

const props = defineProps({
    defaultDate: String,
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

const today = jalali.now()

const viewMode = ref('days')

const currentDate = today.split(' ')[0]

const yearMonth = today.split(' ')[0].split('/').slice(0, 2).join('-')

const currentYearMonth = ref(yearMonth)

const calendar = computed(() => jalali.calendar(currentYearMonth.value))

const dateHeaderTitle = computed(() => calendar.value.title.split(' '))

const mode = ref(props.mode)
provide('mode', mode)

const selectedDate = ref(props.defaultDate || dateModel.value);

const range = ref({...props.defaultRange})

const initializeDate = (defaultDate) => {
    if(defaultDate) {
        selectedDate.value = defaultDate;
        currentYearMonth.value = defaultDate.split('/').slice(0,2).join('-');
    } else {
        selectedDate.value = null;
        currentYearMonth.value = today.split(' ')[0].split('/').slice(0, 2).join('-');
    }
}

initializeDate(props.defaultDate || dateModel.value);

watch(() => dateModel.value, (newDate) => {
    initializeDate(newDate)
}, { immediate: true })

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
        days.push({day, date: dateStr})
    }

    // Add empty days at the end to complete last week
    while (days.length % 7 !== 0) {
        days.push({day: '', date: `empty-end-${days.length}`});
    }
    return days;
});

const onSelectDay = (day) => {

    if (!day) return

    const [year, month] = currentYearMonth.value.split('-');
    // const dayPart = day.split('-')[2] || day
    const formatted = `${year}/${month.padStart(2, '0')}/${day.split('-')[2].padStart(2, '0')}`;

    if (props.mode === 'single') {
        selectedDate.value = formatted;
        dateModel.value = formatted;
    } else {
        if (!range.value.start || (range.value.start && range.value.end)) {
            range.value = { start: formatted, end: null };
        } else if (!range.value.end) {
            if (formatted < range.value.start) {
                range.value = { start: formatted, end: range.value.start };
            } else {
                range.value.end = formatted;
            }
        }
        rangeModel.value = range.value
    }
}

watch(
    () => props.mode,
    (mode) => {
        if(mode === 'single') {
            range.value = { start: null, end: null }
        } else {
            selectedDate.value = null
        }
    }
)

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
                :selected-date:="selectedDate"
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
    </div>
</template>

<style src="./styles/calendar.css"></style>