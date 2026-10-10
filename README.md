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

A Jalali date string in `YYYY/MM/DD` format:

``` js
'1404/08/25'
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

An object containing Jalali date strings in `YYYY/MM/DD` format:

``` js
{
  start: '1404/08/25',
  end: '1404/08/28'
}
```

Either value can be `null` until it is selected.

------------------------------------------------------------------------

# 🧩 Summary

  Mode       v-model           Returned Value   Description
  ---------- ----------------- ---------------- -------------------
  `single`   `v-model:date`    `YYYY/MM/DD` string        Select one date
  `range`    `v-model:range`   `{start, end}`             Select date range

------------------------------------------------------------------------

# 🎨 Props

  -----------------------------------------------------------------------------------
  Prop Name            Type            Default                   Description
  -------------------- --------------- ------------------------- --------------------
  `mode`               String          `"single"`                Select mode:
                                                                 `"single"` or
                                                                 `"range"`

  `v-model:date`       String          `null`                    Selected date in
                                                                 single mode

  `v-model:range`      Object          `{start:null,end:null}`   Selected dates in
                                                                 range mode

  `disable`            String or Array `[]`                      English weekday names
                                                                 to disable

  `showActions`        Boolean         `false`                   Show confirm, cancel,
                                                                 and now buttons
  -----------------------------------------------------------------------------------

Use `disable="Friday"` to make every Friday unavailable, or pass another
weekday name such as `disable="Wednesday"`. To disable more than one weekday,
pass an array:

```vue
<DatePicker v-model:date="selectedDate" disable="Friday" />
<DatePicker v-model:range="selectedRange" mode="range" :disable="['Friday', 'Wednesday']" />
```

Accepted names are `Saturday`, `Sunday`, `Monday`, `Tuesday`, `Wednesday`,
`Thursday`, and `Friday` (case-insensitive). Disabled dates remain visible
but cannot be selected as a single date or range endpoint. A range can span
disabled weekdays.

------------------------------------------------------------------------

## Optional selection actions

Enable `showActions` to display three buttons below the calendar: **تایید**
(confirm), **انصراف** (cancel), and **اکنون** (now).

```vue
<DatePicker v-model:date="selectedDate" show-actions />
<DatePicker v-model:range="selectedRange" mode="range" show-actions />
```

With actions enabled, clicking a day previews a selection inside the
calendar. The bound model changes only when **confirm** is pressed. Single
mode requires a selected date; range mode requires both endpoints. Clicking
the same day twice creates a valid one-day range.

**Cancel** discards the preview and restores the last confirmed or externally
supplied selection, including an initial `defaultDate` or `defaultRange`.
It returns to the days view and the restored selection's month, or today's
month when the selection is empty. The calendar remains visible after
confirming or cancelling.

**Now** previews today's Jalali date in `Asia/Tehran` and displays its month.
In range mode it starts a new range at today with `end: null`; select an end
date before confirming. Now and confirm respect `disable`; a range may still
span disabled weekdays.

External model updates replace the preview. Changing `mode` or `showActions`
discards unconfirmed changes. With `showActions` omitted or set to `false`,
day selections continue updating the model immediately.

### Custom action buttons

Replace each entire button using its named scoped slot:

| Slot | Scope |
| --- | --- |
| `confirm-button` | `{ action, disabled }` |
| `cancel-button` | `{ action, disabled }` |
| `now-button` | `{ action, disabled }` |

Call `action()` to run the built-in behavior and bind `disabled` to your
button. The action itself also checks whether it is allowed. Slots are
rendered only while `showActions` is enabled; omitted slots use the default
buttons. Custom buttons provide their own styling and keyboard focus state.

```vue
<DatePicker v-model:date="selectedDate" show-actions>
  <template #confirm-button="{ action, disabled }">
    <button type="button" class="my-confirm-button" :disabled="disabled" @click="action">
      ثبت تاریخ
    </button>
  </template>
  <template #cancel-button="{ action, disabled }">
    <button type="button" :disabled="disabled" @click="action">لغو</button>
  </template>
  <template #now-button="{ action, disabled }">
    <button type="button" :disabled="disabled" @click="action">امروز</button>
  </template>
</DatePicker>
```

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
  --calendar-disabled-text-color: #8e939d;
  --calendar-month-year-item-bg-color: #F5F7FA;
  --calendar-action-bg-color: #F5F5F5;
  --calendar-action-text-color: #111516;
  --calendar-confirm-bg-color: #111516;
  --calendar-confirm-text-color: #ffffff;
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
