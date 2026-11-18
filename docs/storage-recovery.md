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

## Direct timer links (2026-11-18)

- [x] Validate saved configurations before returning them to the display route.
- [x] Restore nested complex-phase dates before validation.
- [x] Return null for invalid configurations so the existing route fallback sends
      the user to Configure without rendering a broken timer.
- [x] Preserve stored records during reads.
- [x] Verify all five valid timer types reload and start through their direct links.

Validation: 294 Vitest tests, 21 Playwright preset/history/direct-link checks, lint,
TypeScript, and production build passed. Eight new unit regressions first failed.
The initial browser run had two incomplete configuration fixtures; after supplying
required Interval and Work/Rest fields, all 21 checks passed.
