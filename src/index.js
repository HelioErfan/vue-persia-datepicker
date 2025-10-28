import DatePicker from "./components/DatePicker.vue";

export default {
    install(app) {
        app.component('VuePersiaDatePicker', DatePicker)
    }
}

export { DatePicker }