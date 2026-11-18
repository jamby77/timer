# Stored timer recovery

## Recent history (2026-11-18)

- [x] Parse the history array separately from its entries so one malformed entry
      does not hide valid timers before or after it.
- [x] Restore configuration dates, including nested complex phases, before using
      the existing timer validation rules.
- [x] Skip incomplete configurations, malformed phases, and invalid start dates.
- [x] Leave storage untouched when reading history.
- [x] Verify reload, starting a recovered timer, and removing it persistently.

An invalid JSON document or a non-array history value still returns an empty list;
individual entries can only be recovered from a readable array. Adding or removing
history uses the recovered valid entries and writes the updated list normally.

Verification includes unit regressions for five malformed entry shapes and a valid
complex timer with nested dates. The 11 Playwright preset/history checks passed
against the production app, including preserved built-in presets and existing saves.
