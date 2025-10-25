<script setup>
import { computed } from 'vue';


const props = defineProps({
    calendarDays: {
        day: Number | String,
        date: String
    }
})

const weekdays = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج']

const calendarKey = computed(() => {
    const firstRealDay = props.calendarDays.find(day => !!day.day);
    return firstRealDay ? firstRealDay.date.substring(0,7) : Math.random().toString();
})
</script>
<template>
    <div class="vue-persia-datepicker__calendar_days">
        <div class="vue-persia-datepicker__calendar_days_weekdays_header">
            <span v-for="day in weekdays" :key="day">{{ day }}</span>
        </div>
        <transition name="fade" mode="out-in">
            <div :key="calendarKey" class="vue-persia-datepicker__calendar_days_weekdays">
                <div 
                    class="vue-persia-datepicker__calendar_day" 
                    v-for="(day, index) in calendarDays"
                    :key="`${day.date || 'empty'}-${index}`"
                    >
                    <span>{{ day.day || '' }}</span>
                </div>
            </div>
        </transition>
    </div>
</template>
<style src="./styles//calendar.css"></style>