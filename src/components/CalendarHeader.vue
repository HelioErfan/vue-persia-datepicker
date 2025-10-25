<script setup>
defineProps(
    {
        calendarTitle: []
    }
)
</script>
<template>
    <div class="vue-persia-datepicker__header">
        <div class="vue-persia-datepicker__header_calendar_days">
            <button @click="$emit('prev-month')">
                <slot name="prev-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path
                            d="M15 22.75H9C3.57 22.75 1.25 20.43 1.25 15V9C1.25 3.57 3.57 1.25 9 1.25H15C20.43 1.25 22.75 3.57 22.75 9V15C22.75 20.43 20.43 22.75 15 22.75ZM9 2.75C4.39 2.75 2.75 4.39 2.75 9V15C2.75 19.61 4.39 21.25 9 21.25H15C19.61 21.25 21.25 19.61 21.25 15V9C21.25 4.39 19.61 2.75 15 2.75H9Z"
                            fill="#99A0AE" />
                        <path
                            d="M10.7397 16.28C10.5497 16.28 10.3597 16.21 10.2097 16.06C9.91969 15.77 9.91969 15.29 10.2097 15L13.2097 12L10.2097 9.00003C9.91969 8.71003 9.91969 8.23003 10.2097 7.94003C10.4997 7.65003 10.9797 7.65003 11.2697 7.94003L14.7997 11.47C15.0897 11.76 15.0897 12.24 14.7997 12.53L11.2697 16.06C11.1197 16.21 10.9297 16.28 10.7397 16.28Z"
                            fill="#99A0AE" />
                    </svg>
                </slot>
            </button>
            <div>
                <p>
                    <strong class="vue-persia-datepicker__header__month_year">
                        <span>{{ calendarTitle[0] }}</span>
                        <span>{{ calendarTitle[1] }}</span>
                    </strong>
                </p>
            </div>
            <button @click="$emit('next-month')">
                <slot name="next-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path
                            d="M15 22.75H9C3.57 22.75 1.25 20.43 1.25 15V9C1.25 3.57 3.57 1.25 9 1.25H15C20.43 1.25 22.75 3.57 22.75 9V15C22.75 20.43 20.43 22.75 15 22.75ZM9 2.75C4.39 2.75 2.75 4.39 2.75 9V15C2.75 19.61 4.39 21.25 9 21.25H15C19.61 21.25 21.25 19.61 21.25 15V9C21.25 4.39 19.61 2.75 15 2.75H9Z"
                            fill="#99A0AE" />
                        <path
                            d="M13.2599 16.28C13.0699 16.28 12.8799 16.21 12.7299 16.06L9.19992 12.53C8.90992 12.24 8.90992 11.76 9.19992 11.47L12.7299 7.94003C13.0199 7.65003 13.4999 7.65003 13.7899 7.94003C14.0799 8.23003 14.0799 8.71003 13.7899 9.00003L10.7899 12L13.7899 15C14.0799 15.29 14.0799 15.77 13.7899 16.06C13.6499 16.21 13.4599 16.28 13.2599 16.28Z"
                            fill="#99A0AE" />
                    </svg>
                </slot>
            </button>
        </div>
    </div>
</template>
<style src="./styles/calendar.css"></style>