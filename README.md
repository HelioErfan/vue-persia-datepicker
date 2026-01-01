# Vue Persia Datepicker

A modern, customizable, and lightweight **Vue.js 3 Persian (Jalali)
Datepicker** with support for **single date** and **range date
selection**.

✔ Fully compatible with Vue 3\
✔ Supports both Single & Range mode\
✔ Accurate Jalali date engine\
✔ Beautiful UI + Fully customizable\
✔ Easy to install and use

------------------------------------------------------------------------

## 📦 Installation

Install via npm:

``` bash
npm install @helioerfan/vue-persia-datepicker
```

Or via yarn:

``` bash
yarn add @helioerfan/vue-persia-datepicker
```

------------------------------------------------------------------------

## 🚀 Getting Started

### **1. Global Installation (Recommended)**

``` js
// main.js
import { createApp } from 'vue';
import App from './App.vue';

import VuePersiaDatepicker from '@helioerfan/vue-persia-datepicker';
import '@helioerfan/vue-persia-datepicker/dist/vue-persia-datepicker.css'

const app = createApp(App);
app.use(VuePersiaDatepicker);
app.mount('#app');
```

------------------------------------------------------------------------

### **2. Local Component Import**

``` vue
<script setup>
import { DatePicker } from '@helioerfan/vue-persia-datepicker';
import '@helioerfan/vue-persia-datepicker/dist/vue-persia-datepicker.css'
</script>

<template>
  <DatePicker />
</template>
```

------------------------------------------------------------------------

# 🌀 v-model Modes (Single & Range)

This datepicker supports **two different modes**, each with its own
`v-model`.

------------------------------------------------------------------------

# 🟦 **1. Single Date Mode**

Use:

-   `mode="single"`
-   `v-model:date`

### Example

``` vue
<template>
  <div>
    <DatePicker v-model:date="selectedDate" mode="single" />
    <p>Selected Date: {{ selectedDate }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const selectedDate = ref(null);
</script>
```

### Returns

A single JavaScript `Date` object:

``` js
1404/08/25
```

------------------------------------------------------------------------

# 🟩 **2. Range Mode**

Use:

-   `mode="range"`
-   `v-model:range`

### Example

``` vue
<template>
  <div>
    <DatePicker v-model:range="selectedRange" mode="range" />
    <p>Range: {{ selectedRange }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const selectedRange = ref({
  start: null,
  end: null
});
</script>
```

### Returns

An object:

``` js
{
  start: Date | null,
  end: Date | null
}
```

------------------------------------------------------------------------

# 🧩 Summary

  Mode       v-model           Returned Value   Description
  ---------- ----------------- ---------------- -------------------
  `single`   `v-model:date`    `Date`           Select one date
  `range`    `v-model:range`   `{start, end}`   Select date range

------------------------------------------------------------------------

# 🎨 Props

  -----------------------------------------------------------------------------------
  Prop Name            Type            Default                   Description
  -------------------- --------------- ------------------------- --------------------
  `mode`               String          `"single"`                Select mode:
                                                                 `"single"` or
                                                                 `"range"`

  `v-model:date`       Date            `null`                    Selected date in
                                                                 single mode

  `v-model:range`      Object          `{start:null,end:null}`   Selected dates in
                                                                 range mode
  -----------------------------------------------------------------------------------

------------------------------------------------------------------------

# 🔔 Events

  Event Name       Description
  ---------------- ----------------------
  `update:date`    Fires in single mode
  `update:range`   Fires in range mode
  `opened`         Dropdown opened
  `closed`         Dropdown closed
  `cleared`        Value cleared

------------------------------------------------------------------------

## 🖌️ Custom Styling (CSS Variables)

``` css
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
  --calendar-month-year-item-bg-color: #F5F7FA;
}
```

------------------------------------------------------------------------


# 🔧 Dependencies

-   **@webilix/jalali-date-time**
-   **moment-jalaali**
-   **vue 3**

------------------------------------------------------------------------

# 🤝 Contributing

1.  Fork the project\
2.  Create a new branch\
3.  Commit your changes\
4.  Submit a pull request

------------------------------------------------------------------------

# ❤️ Acknowledgments

-   Jalali utilities by **@webilix/jalali-date-time**
-   Formatting via **moment-jalaali**
-   Built with Vue + Vite

------------------------------------------------------------------------

# ⭐ Support

Give a ⭐ on GitHub if you like this project!
