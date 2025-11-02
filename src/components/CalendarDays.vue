<script setup>
import { ref, computed, watch } from 'vue';


const props = defineProps({
    calendarDays: {
        day: Number | String,
        date: String
    },
    selectedDate: String,
    currentDay: String,
    mode: {
        type: String,
        default: 'single',
    },
    range: {
        type: Object,
        default: () => ({ start: null, end: null })
    }
})

const emit = defineEmits(['selected-day'])

const weekdays = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج']

const selectedDay = ref('');
const localRange = ref({start: null, end: null})

const selectDay = (day) => {
    if (!day.day) return;

    if (props.mode === 'single') {
        selectedDay.value = day.date;
        emit('selected-day', day.date);
    } else {
        if (!localRange.value.start || (localRange.value.start && localRange.value.end)) {
            localRange.value = { start: day.date, end: null };
        } else if (!localRange.value.end) {
            if (day.date < localRange.value.start) {
                localRange.value = { start: day.date, end: localRange.value.start };
            } else {
                localRange.value.end = day.date;
            }
        }
        emit('selected-range', localRange.value.start && localRange.value.end ? localRange.value.end : day.date)
    }
}

watch(
    () => props.selectedDate,
    (newDate) => {
        if(newDate) {
            selectDay.value = newDate.replace(/\//g, '-');
        } else {
            selectedDay.value = null;
        }
    },
    { immediate: true }
)

const isCurrentDay = (dayDate) => {
    return dayDate === props.currentDay || dayDate.replace(/-/g, '/') == props.currentDay;
}

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
                    v-for="(day, index) in calendarDays"
                    class="vue-persia-datepicker__calendar_day"
                    :class="{ empty: !day.day, 'vue-persia-datepicker__calendar_day_selected': selectedDay === day.date,  'vue-persia-datepicker__calendar_current_day': isCurrentDay(day.date) }" 
                    :key="`${day.date || 'empty'}-${index}`"
                    @click="selectDay(day)"
                    >
                    <span>{{ day.day || '' }}</span>
                    <span v-if="isCurrentDay(day.date)" class="vue-persia-datepicker__calendar_current_dot"/>
                </div>
            </div>
        </transition>
    </div>
</template>
<style src="./styles//calendar.css"></style>