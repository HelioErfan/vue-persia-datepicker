import DatePicker from "./components/DatePicker.vue";

export default {
    install(app) {
        app.component('PersianDatePicker', DatePicker)
    }
}

export { DatePicker }