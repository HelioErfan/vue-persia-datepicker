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

  `min`                String or Date  `null`                    Earliest selectable day

  `max`                String or Date  `null`                    Latest selectable day

  `disabledDates`      String, Date,   `[]`                      Specific dates or inclusive
                       Object or Array                         intervals to disable

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

## Date limits and custom disabled dates

Use `min` and `max` to define the allowed dates. Days before `min` and days
after `max` are disabled. The boundary days themselves remain selectable,
unless another rule disables them. Either prop can be used on its own:

```vue
<DatePicker v-model:date="selectedDate" min="1405/08/05" />
<DatePicker v-model:date="selectedDate" max="1405/08/20" />
<DatePicker v-model:date="selectedDate" min="1405/08/05" max="1405/08/20" />
```

To disable the dates **inside** a particular interval, use `disabledDates`
with `{ start, end }`. Both endpoints are disabled too. You can supply a
single date, one interval, or an array mixing dates and intervals:

```vue
<DatePicker :disabled-dates="'1405/08/05'" />
<DatePicker :disabled-dates="{ start: '1405/08/10', end: '1405/08/15' }" />
<DatePicker
  v-model:range="selectedRange"
  mode="range"
  disable="Friday"
  min="1405/08/01"
  max="1405/09/30"
  :disabled-dates="[
    '1405/08/05',
    { start: '1405/08/10', end: '1405/08/15' },
    new Date('2026-11-10T08:00:00Z')
  ]"
/>
```

All rules combine: a day is disabled if **any** rule disables it. A custom
date cannot override a weekday or a min/max limit. As with `disable`, range
mode checks only the endpoints; a range can span disabled dates and intervals.
Month and year navigation remains available even outside the allowed dates.

### Date input formats

`min`, `max`, each custom date, and each interval endpoint accept:

- A real Jalali date string in exactly `YYYY/MM/DD` format with English digits.
- A valid JavaScript `Date`. Its instant is converted to the Jalali day in
  `Asia/Tehran`; its time is then ignored for comparisons.

For example, `new Date('2025-03-20T20:30:00Z')` represents `1404/01/01` in
Tehran. Prefer explicit offsets when constructing dates from timestamps;
a `Date` constructed from local clock fields uses your environment's timezone.
The model outputs remain Jalali strings, even when limits use `Date` objects.

Gregorian strings, timestamps, Persian digits, hyphenated strings and relative
keywords such as `today` are not accepted by these new props. Invalid dates
(including a non-leap Esfand 30) are ignored rather than rolled into another day.

### Disable today, tomorrow, or the past

The following example computes tomorrow from Tehran's calendar day, independently
of the browser's timezone. UTC noon represents that next day in Tehran:

```vue
<script setup>
const today = new Date()
const parts = Object.fromEntries(
  new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Tehran',
    calendar: 'gregory',
    numberingSystem: 'latn',
    year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(today).map(({ type, value }) => [type, value])
)
const tomorrow = new Date(Date.UTC(+parts.year, +parts.month - 1, +parts.day + 1, 12))
</script>

<template>
  <!-- Disable today and tomorrow -->
  <DatePicker :disabled-dates="[today, tomorrow]" />

  <!-- Disable today and all earlier dates; allow tomorrow onward -->
  <DatePicker :min="tomorrow" />

  <!-- Disable earlier dates; allow today onward -->
  <DatePicker :min="today" />

  <!-- Disable future dates; allow today and earlier dates -->
  <DatePicker :max="today" />
</template>
```

These values are absolute dates. If the calendar remains mounted across midnight,
the parent must recalculate any limits intended to follow today.

### Reactive changes and invalid rules

Changes to limits, array items and interval fields update disabled cells and
the availability of confirm/now actions, including custom button slots. Replace
a `Date` instance to update it; mutating the same instance with `setDate()` does
not trigger Vue reactivity.

Existing model values and unconfirmed previews are preserved if new rules
disable them. No model update is emitted just because rules change, and a disabled
selection cannot be confirmed. Cancel still restores the saved selection. If a
partially selected range's start becomes disabled, the next allowed day starts
a fresh range with `end: null`.

- `null` or `undefined` limits mean no bound; `null`, `undefined` or `[]` for
  `disabledDates` mean no custom exclusions.
- Invalid single dates and limits are ignored individually. An interval with
  a missing or invalid endpoint is ignored entirely; open-ended interval objects
  are not supported. Use `min` or `max` for one-sided limits.
- Reversed custom interval endpoints are sorted without changing the input object.
- If `min` is after `max`, all dates are disabled; the bounds are not swapped.
- Repeated dates and overlapping intervals are supported.

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
date before confirming. Now and confirm respect `disable`, `min`, `max`, and
`disabledDates`; a range may still span disabled dates when both endpoints are allowed.

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
