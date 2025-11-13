<script setup>
import DatePicker from './components/DatePicker.vue'
import { ref } from 'vue'

const selectedDate = ref(null)
const selectedRange = ref({ start: null, end: null })
</script>

<template>
    <div id="app">
        <div style="display: flex; align-items: center; justify-content: center; flex-direction: column;">
            <p>سینگل</p>
            <DatePicker v-model:date="selectedDate" mode="single" />
            <p>رنج</p>
            <DatePicker v-model:range="selectedRange" mode="range" />
            <p>selectedDate: {{ selectedDate }}</p>
            <p>selectedRange: {{ selectedRange }}</p>
            <p>selectedRange start: {{ selectedRange.start }}</p>
            <p>selectedRange end: {{ selectedRange.end }}</p>
        </div>
    </div>
</template>
