<script setup>
defineProps(
    {
        calendarTitle: Array,
        viewMode: {
            days: String,
            months: String,
            years: String
        }
    }
)
defineEmits(['prev-month', 'next-month', 'toggle-view']);

function createRipple(event) {
    const button = event.currentTarget;

    const ripple = document.createElement("span");
    ripple.classList.add("ripple");

    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = size + "px";
    ripple.style.left = event.clientX - rect.left - size / 2 + "px";
    ripple.style.top = event.clientY - rect.top - size / 2 + "px";

    const oldRipple = button.querySelector(".ripple");
    if (oldRipple) oldRipple.remove();

    button.appendChild(ripple);

    setTimeout(() => ripple.remove(), 600)
}
</script>
<template>
    <div class="vue-persia-datepicker__header" :class="`${viewMode}-mode`">
        <div v-if="viewMode === 'days'" class="vue-persia-datepicker__header_calendar_days">
            <button @click="(event) => { createRipple(event); $emit('prev-month') }">
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
                <p style="margin: 0;">
                    <strong class="vue-persia-datepicker__header__month_year">
                        <span @click="$emit('toggle-view', 'months')">{{ calendarTitle[0] }}</span>
                        <span @click="$emit('toggle-view', 'years')">{{ calendarTitle[1] }}</span>
                    </strong>
                </p>
            </div>
            <button @click="(event) => { createRipple(event); $emit('next-month') }">
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
        <div v-else class="vue-persia-datepicker__header_calendar_months">
            <div>
                <p style="margin: 0;">
                    <strong class="vue-persia-datepicker__header__month_year">
                        <span @click="$emit('toggle-view', 'months')">{{ calendarTitle[0] }}</span>
                        <span @click="$emit('toggle-view', 'years')">{{ calendarTitle[1] }}</span>
                    </strong>
                </p>
            </div>
            <button @click="(event) => { createRipple(event); $emit('toggle-view', viewMode === 'years' ? 'months' : 'days') }">
                <slot name="arrow-left-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path fill-rule="evenodd" clip-rule="evenodd"
                            d="M10.1006 18.6003C9.80775 18.8932 9.33288 18.8932 9.03998 18.6003L2.96998 12.5303C2.82933 12.3896 2.75031 12.1989 2.75031 11.9999C2.75031 11.801 2.82933 11.6103 2.96998 11.4696L9.03998 5.39962C9.33288 5.10673 9.80775 5.10673 10.1006 5.39962C10.3935 5.69251 10.3935 6.16739 10.1006 6.46028L4.56097 11.9999L10.1006 17.5396C10.3935 17.8325 10.3935 18.3074 10.1006 18.6003Z"
                            fill="#525866" />
                        <path fill-rule="evenodd" clip-rule="evenodd"
                            d="M21.25 12C21.25 12.4142 20.9142 12.75 20.5 12.75L3.67 12.75C3.25579 12.75 2.92 12.4142 2.92 12C2.92 11.5858 3.25579 11.25 3.67 11.25L20.5 11.25C20.9142 11.25 21.25 11.5858 21.25 12Z"
                            fill="#525866" />
                    </svg>
                </slot>
            </button>
        </div>
    </div>
</template>
<style src="./styles/calendar.css"></style>