<script setup>
import { ref, watch } from 'vue'
import useJalaliMonths from './jalaliConstants';

const jalaliConstants = useJalaliMonths()

const props = defineProps(
    {
        currentYearMonth: String,
        currentMonth: String
    }
)

const emit = defineEmits(
    [
        'back-to-days',
        'month-selected'
    ]
)

const isCurrentMonth = (monthDate) => {
    const [currentYear, currentMonth] = props.currentMonth.split('/');
    const [selectedYear, selectedMonth] = props.currentYearMonth.split('-');
    return monthDate === currentMonth && currentYear === selectedYear;
}

const selectedMonth = ref('01');

watch(() => props.currentYearMonth, (newMonth) => {
    if(!newMonth) {
        selectedMonth.value = '01';
    } else {
        selectedMonth.value = newMonth.split('-')[1] || '01';
    }
}, { immediate: true })

const selectMonth = (month) => {
    selectedMonth.value = month.value;
    emit('month-selected', month.value);
}
</script>
<template>
    <div class="vue-persia-datepicker__calendar_month_grid">
        <div 
            v-for="month in jalaliConstants" 
            :key="month.value" 
            class="vue-persia-datepicker__calendar_month_item"
            :class="{ 'vue-persia-datepicker__calendar_month_selected': selectMonth === month.value, 'vue-persia-datepicker__calendar_current_month': isCurrentMonth(month.value) }"
            @click="selectMonth(month)"
            >
            <span>{{ month.name }}</span>
            <span v-if="isCurrentMonth(month.value)" class="vue-persia-datepicker__calendar_current_dot"></span>
        </div>
    </div>
</template>
<style src="./styles/calendar.css"></style>