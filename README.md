md
# Vue Persia Datepicker

A Vue.js 3 component for displaying and selecting dates in the Jalali (Persian) calendar.

## Key Features & Benefits

*   **Jalali Calendar Support:**  Displays dates according to the Jalali calendar.
*   **Vue.js 3 Component:** Seamless integration with Vue.js 3 projects.
*   **Easy to Use:** Simple and intuitive API for developers.
*   **Customizable:** Offers various configuration options to tailor the component to specific needs.
*   **Lightweight:** Minimal dependencies and a small bundle size.

## Prerequisites & Dependencies

Before using Vue Persia Datepicker, ensure that you have the following installed:

*   **Node.js:**  Version 16 or higher is recommended.
*   **npm or Yarn:** Package manager.
*   **Vue.js:** Version 3.x

The project also relies on the following dependencies, which are automatically installed via npm/yarn:

*   `@webilix/jalali-date-time`:  A library for Jalali date and time manipulation.
*   `moment-jalaali`: Library for jalali date time formatting and conversion.
*   `vue`: Vue.js framework.

## Installation & Setup Instructions

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/HelioErfan/vue-persia-datepicker.git
    cd vue-persia-datepicker
    ```

2.  **Install dependencies:**

    ```bash
    npm install  # or yarn install
    ```

3.  **Build the project:**
    ```bash
    npm run build # or yarn build
    ```

4.  **Import and use the component in your Vue.js project:**

    ```javascript
    import DatePicker from './src/components/DatePicker.vue';

    export default {
      components: {
        DatePicker
      },
      // ...
    }
    ```

## Usage Examples & API Documentation

**Basic Usage:**

```vue
<template>
  <div>
    <DatePicker v-model="selectedDate" />
    <p>Selected Date: {{ selectedDate }}</p>
  </div>
</template>

<script>
import DatePicker from './src/components/DatePicker.vue';
import { ref } from 'vue';

export default {
  components: {
    DatePicker
  },
  setup() {
    const selectedDate = ref(null);

    return {
      selectedDate
    };
  }
}
</script>
```

**Component Props:**

| Prop Name       | Type   | Default Value | Description                                                              |
| --------------- | ------ | ------------- | ------------------------------------------------------------------------ |
| `v-model`       | Date   | `null`        | The selected date (as a JavaScript Date object).                          |
| `format`        | String | `YYYY-MM-DD`  | Date Format using `moment-jalaali` library.                                           |
| `initialDate` | Date  |  Today's Date |  Set the initial displayed date in the calendar when it first loads.                                          |
| `disabledDates` | Array | `[]`          | An array of dates to disable.                                          |

## Configuration Options

The following configuration options are available:

*   **CSS Styling:** Customize the appearance of the datepicker by modifying the CSS variables in `src/components/styles/calendar.css`. You can override these variables in your own CSS files.

    ```css
    :root {
        --calendar-bg-color: #ffffff;
        --calendar-border-color: #E1E4EA;
        --calendar-border-radius: 12px;
        --calendar-header-padding: 12px;
        --calendar-header-bg-color: #F5F7FA;
        --ripple-color: rgba(4, 16, 26, 0.3);
        --calendar-select-bg-color: #335CFF;
        --calendar-select-text-color: #ffffff;
        --calendar-current: #335CFF;
        --calendar-month_Year_item-bg-color: #F5F7FA;
    }
    ```

## Contributing Guidelines

Contributions are welcome!  Here's how you can contribute:

1.  Fork the repository.
2.  Create a new branch for your feature or bug fix.
3.  Implement your changes.
4.  Write tests to ensure your changes are working correctly.
5.  Submit a pull request with a clear description of your changes.

## License Information

This project has no license specified. All rights are reserved.

## Acknowledgments

*   This project utilizes the `@webilix/jalali-date-time` library for Jalali date calculations.
*   Uses `moment-jalaali` for date formatting.
*   Built using Vue.js and Vite.