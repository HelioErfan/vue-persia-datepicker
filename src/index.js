import './components/styles/calendar.css'
import DatePicker from "./components/DatePicker.vue";

const VuePersiaDatePicker = {
    install(app) {
        app.component('VuePersiaDatePicker', DatePicker)
    }
}
export default VuePersiaDatePicker
export { DatePicker } 