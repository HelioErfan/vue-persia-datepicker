<script setup>
import { ref, watch } from 'vue';
import moment from 'moment-jalaali';
const props = defineProps(
    {
        currentYearMonth: String,
        currentYear: String
    }
)

const emit = defineEmits(['year-selected'])

const currentYear = moment().jYear();

const years = Array.from({length: 101}, (_,i) => {
    const yearValue = currentYear - 80 + i;
    return {
        name: yearValue.toString(),
        value: yearValue
    }
})

const isCurrentYear = (year) => {
    const [currentYear] = props.currentYear.split('/')
    return year.toString() === currentYear;
}

const selectedYear= ref(currentYear)

watch(() => props.currentYearMonth, (newYear) => {
    if(!newYear) {
        selectedYear.value = currentYear
    } else {
        selectedYear.value === parseInt(newYear.split('-')[0])
    }
}, { immediate: true })

const selectYear = (year) => {
    selectedYear.value = year.value;
    emit('year-selected' , year.value)
}
</script>
<template>
    <div class="vue-persia-datepicker__calendar_year_grid">
        <div 
            class="vue-persia-datepicker__calendar_year_item"
            :class="{ 'vue-persia-datepicker__calendar_current_year': isCurrentYear(year.value), 'vue-persia-datepicker__calendar_year_selected' : selectedYear == year.value }"
            v-for="year in years"
            :key="year.value"
            @click="selectYear(year)"
        >
            <span>{{ year.name }}</span>
            <span v-if="isCurrentYear(year.value)" class="vue-persia-datepicker__calendar_current_dot"/>
        </div>
    </div>
</template>
<style src="./styles/calendar.css"></style>