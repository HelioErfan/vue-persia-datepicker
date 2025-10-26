<script setup>
import { onMounted, ref, watch } from 'vue'
import useJalaliMonths from './jalaliConstants';

const jalaliConstants = useJalaliMonths()

onMounted(() => {
    console.log('this is the Jalali Months:' , jalaliConstants)
})
</script>
<template>
    <div class="vue-persia-datepicker__calendar_month_grid">
        <div 
            v-for="month in jalaliConstants" 
            :key="month.value" 
            class="vue-persia-datepicker__calendar_month_item"
            >
            <span>{{ month.name }}</span>
        </div>
    </div>
</template>
<style src="./styles/calendar.css"></style>