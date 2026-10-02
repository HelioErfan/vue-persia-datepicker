# Project guidance

This repository is a Vue 3 Jalali datepicker library built with Vite. Keep changes focused on the library and its documented consumer API.

## Where to work

- `src/components/DatePicker.vue` owns calendar state, date selection, and the `date` and `range` models.
- `src/components/CalendarDays.vue`, `CalendarHeader.vue`, `MonthSelector.vue`, and `YearSelector.vue` render the calendar views.
- `src/components/jalaliConstants.js` contains Persian month names. `src/components/styles/calendar.css` contains the shared styles.
- `src/index.js` exports the `DatePicker` component and the global Vue plugin. `vite.config.js` configures the library build.
- `README.md` documents consumer usage. Check it when changing props, events, model values, styling, or installation instructions.

## Preserve behavior deliberately

- Check both `single` (`v-model:date`) and `range` (`v-model:range`) modes when changing selection behavior.
- The current component works with formatted Jalali date strings (`YYYY/MM/DD`) at its model boundary and uses hyphenated dates internally. Verify the actual implementation before changing or documenting value types; the README currently describes a `Date` return value.
- Check month and year transitions, Jalali leap years, range ordering, and the `Asia/Tehran` timezone when changing date calculations.
- Keep the named component export, global plugin registration, and CSS bundle usable by consumers when changing package entry points or styles.

## Verification

- Run `npm run build` after changes that affect library code or packaging.
- There are currently no `test` or `lint` scripts. For behavior changes, verify the affected interaction in both selection modes and report what was checked.
- Report any build or verification failure accurately; do not claim a check passed unless it ran successfully.

## Git

All changes must be uncommitted untill I tell to commit it.
