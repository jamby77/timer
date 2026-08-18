# Code Review: X-Timer Project

**Date:** 2025-02-12
**Scope:** Full codebase review — core timer engine, hooks, components, types, sound system, storage, tests, and configuration.

---

## 🔴 P0 — Bugs & Correctness (Fix Immediately)

### 1. `useTimer` recreates Timer on every callback change

**File:** `src/hooks/useTimer.ts:86`

The `useEffect` that creates the `Timer` instance depends on `onTick`, `onStateChange`, and `onComplete`. Since these are typically inline functions or unstable references, the timer gets **destroyed and recreated on nearly every render**, resetting any running timer.

Other hooks (`useWorkRestTimer`, `useStopwatch`) correctly use `useRef` to hold callbacks — this one should do the same.

**Fix:** Store callbacks in refs and use stable wrappers, removing them from the `useEffect` dependency array.

---

### 2. `useIntervalTimer` assigns to ref inside `useMemo`

**File:** `src/hooks/useIntervalTimer.ts:79`

Assigning to a `ref.current` from `useMemo` is a side effect during render, which violates React's rules. The `useMemo` return is stored in `managerRef.current`, and the `useEffect` at line 125 depends on `managerRef.current` directly — which is not a valid React dependency (refs don't trigger re-renders). This could lead to stale closures or missed cleanup.

**Fix:** Refactor to use `useEffect` + `useRef` pattern instead of `useMemo` with side effects.

---

### 3. `useMediaQuery` SSR crash risk

**File:** `src/hooks/use-media-query.ts:4`

The initial state function calls `window.matchMedia` unconditionally. During SSR (Next.js), `window` is undefined, causing a crash.

**Fix:** Guard with `typeof window !== 'undefined'`:
```ts
const [matches, setMatches] = useState(() =>
  typeof window !== 'undefined' ? window.matchMedia(query).matches : false
)
```

---

### 4. `TimerContext` race condition with multiple timers

**File:** `src/contexts/TimerContext.tsx:27-29`

Each timer hook calls `setTimerActive(false)` when it becomes idle. If two timers are running and one stops, it sets `isAnyTimerActive = false`, hiding the navigation even though the other timer is still running.

**Fix:** Use a **counter or Set** to track active timers instead of a single boolean.

---

## 🟡 P1 — Important Issues

### 5. Missing `onWorkStepComplete` in `useMemo` deps

**File:** `src/hooks/useIntervalTimer.ts:113-122`

`onWorkStepComplete` is used inside `generateSteps` but is **not listed** in the dependency array. If the callback changes, the `TimerManager` will still use the stale one.

**Fix:** Add `onWorkStepComplete` to the dependency array.

---

### 6. CSS typo in `TimerProgressIndicator`

**File:** `src/components/display/TimerProgressIndicator.tsx:43`

`textbase` should be `text-base` (with a hyphen). The class does nothing as-is.

**Fix:** Change `textbase` → `text-base`.

---

### 7. Duplicate `TimerState` imports in `Interval.tsx`

**File:** `src/components/display/Interval.tsx:7-8`

```ts
import { TimerState as BaseTimerState, formatTime } from '@/lib/timer'
import { TimerState } from '@/lib/timer/types'
```

These are the **same enum** imported twice under different names.

**Fix:** Consolidate to a single canonical import path. Prefer importing enums from `@/lib/enums`.

---

### 8. Duplicate functions in `utils.ts`

**File:** `src/lib/timer/utils.ts`

`getValidArrowTime` (line 150) and `getArrowByType` (line 191) are **functionally identical** — they both dispatch to `getValidArrowMinuteOrSecond` / `getValidArrowHour` by type.

**Fix:** Remove one and alias the other if needed.

---

### 9. Redundant enum re-exports

**Files:** `src/lib/timer/types.ts:15`, `src/types/configure.ts:4`

Enums defined in `@/lib/enums` are re-exported from multiple modules, leading to confusing import paths.

**Fix:** Establish `@/lib/enums` as the single canonical source. Remove re-exports from `types.ts` and `configure.ts`, updating all consumers.

---

### 10. `Stopwatch.stop()` silently ignores near-limit calls

**File:** `src/lib/timer/Stopwatch.ts:94`

The magic `- 100` threshold silently prevents stopping near the time limit. This is surprising behavior with no documentation.

**Fix:** Either document the rationale clearly or remove the threshold, relying on the caller to handle edge cases.

---

## 🟢 P2 — Code Quality Improvements

### 11. `enums.ts` imports React in a pure data file

**File:** `src/lib/enums.ts:1-2`

This file defines enums (pure data) but also imports React component types and Lucide icons (`TIMER_TYPE_ICONS`). This couples UI concerns with data definitions.

**Fix:** Move the `TIMER_TYPE_ICONS` map and its imports to a separate UI-oriented file (e.g., `src/lib/timer-type-icons.ts`).

---

### 12. Extract repeated `onStop` pattern in `ComplexTimer`

**File:** `src/components/display/ComplexTimer.tsx:94-189`

All four timer-type branches in `renderPhaseTimer` repeat the same `onStop` logic:
```ts
config.autoAdvance ?? true ? goToNextPhase() : setIsComplexRunning(false)
```

**Fix:** Extract into a shared `handlePhaseStop` callback to reduce duplication.

---

### 13. `Timer.animationFrameId` union type is overly broad

**File:** `src/lib/timer/Timer.ts:11`

The type `number | NodeJS.Timeout | null` is confusing since the polyfill already normalizes the return type. The cast at line 227 (`as number`) confirms the type system is fighting itself.

**Fix:** Simplify the type to `number | null` since the rAF polyfill always returns a number.

---

### 14. `useStopwatch` has misleading `restart` deps

**File:** `src/hooks/useStopwatch.ts:68-71`

The deps list `[reset, start]` but the body calls ref methods directly, not the `reset`/`start` functions. These deps are misleading.

**Fix:** Change deps to `[]` since only the stable ref is used.

---

### 15. Stray `{' '}` in `Stopwatch.tsx`

**File:** `src/components/display/Stopwatch.tsx:155`

A dangling JSX whitespace expression between the progress indicator and `TimerButton` — likely a merge artifact.

**Fix:** Remove the stray expression.

---

## 🔵 P3 — Minor Cleanup

### 16. `let` where `const` suffices in `formatTime`

**File:** `src/lib/timer/utils.ts:12-13`

`minStr` and `secStr` are never reassigned.

**Fix:** Change `let` → `const`.

---

### 17. `TimerCard` prop interface naming

**File:** `src/components/display/TimerCard.tsx:15`

Named `CardProps` which shadows shadcn's own `CardProps` if ever imported alongside.

**Fix:** Rename to `TimerCardProps`.

---

### 18. Verify dead code: `Sounds.tsx`

**Files:** `src/components/display/Sounds.tsx`, `src/components/display/Sounds.stories.tsx`

These appear unused in the main app. Verify if they are dead code and remove if so.

---

## 🧪 Testing Gaps

| Area | Status | Recommendation |
|------|--------|----------------|
| `Timer` class | ✅ Good coverage | — |
| `useTimer` hook | ✅ Good coverage | Add `TimerProvider` wrapper |
| `useWorkRestTimer` hook | ✅ Good coverage | — |
| `usePreStartCountdown` hook | ✅ Good coverage | — |
| `storage` utilities | ✅ Good coverage | — |
| `TimerManager` class | ❌ No tests | Add unit tests for sequence orchestration, step changes, repeats |
| `Stopwatch` class | ❌ No tests | Add unit tests for elapsed time, time limits, auto-stop |
| `SoundManager` / `SoundEngine` | ❌ No tests | Add unit tests for state tracking, debouncing, Web Audio API |
| `useIntervalTimer` hook | ❌ No tests | Add hook-level tests |
| Display components | ❌ No render tests | Add component tests via Storybook or React Testing Library |
| `useTimer` tests missing Provider | ⚠️ Fragile | Wrap test renders with `TimerProvider` |

---

## ✅ Positive Observations

- **Clean separation** between timer engine (`Timer`, `Stopwatch`, `TimerManager`) and React hooks
- **Solid type system** — discriminated unions for `AnyTimerConfig`, per-timer-type config interfaces
- **Well-structured sound system** — singleton `SoundEngine`, Web Audio API with graceful degradation, debounced cue playback
- **Wake Lock integration** — re-acquires on visibility change, proper cleanup
- **Comprehensive test suite for covered areas** — real-time testing (no mocked timers), good edge-case coverage (double-clicks, rapid sequences, zero/negative times)
- **Good use of `useReducer`** in `useTimer` for clean state transitions
- **Config hashing** via `TimerConfigHash` for deduplication is a nice pattern
- **Pre-start countdown** as a composable hook is well-designed
- **Testing utilities** — well-organized `src/testing/` with factory functions and mocks

---

## ⚙️ Configuration & Build Notes

- `dev` uses `--turbopack` but `build` uses `--webpack` — this can lead to behavior differences between dev and production. Consider aligning.
- `autoprefixer` is in devDependencies but PostCSS config uses `@tailwindcss/postcss` — verify autoprefixer is actually needed.
- `vitest.unit.config.ts` uses `jsdom` while the main `vitest.config.ts` uses node + Playwright — ensure tests are consistently run with the correct config.

---

## Suggested Fix Order

1. **P0 items first** — these are real bugs that affect runtime behavior
2. **P1 items next** — these cause subtle issues or developer confusion
3. **Testing gaps** — prioritize `TimerManager` and `useIntervalTimer` as they have the most complex logic
4. **P2/P3 cleanup** — tackle as part of normal development cadence
