<script setup>
import { ref, computed, watch } from 'vue'
import { JalaliDateTime } from '@webilix/jalali-date-time';
import moment from 'moment-jalaali';
import CalendarHeader from './CalendarHeader.vue'

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

const currentDate = today.split(' ')[0]

const yearMonth = today.split(' ')[0].split('/').slice(0, 2).join('-')

const cuurentYearMonth = ref(yearMonth)

const calendar = computed(() => jalali.calendar(cuurentYearMonth.value))

const dateHeaderTitle = computed(() => calendar.value.title.split(' '))
</script>

<template>
    <div class="vue-persia-datepicker__container">
        <div>
            <CalendarHeader
                :calendarTitle="dateHeaderTitle"
            />
        </div>
    </div>
</template>

<style src="./styles/calendar.css"></style>