import DatePicker from "./components/DatePicker.vue";

export default {
    install(app) {
        app.component('DatePicker', DatePicker)
    }
}

export { DatePicker }