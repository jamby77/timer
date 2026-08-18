---
"timer": patch
---

fix(core): apply code review fixes — bugs, quality, cleanup

- Fix useTimer recreating Timer instance on every callback change by stabilizing with refs
- Fix useIntervalTimer side effect in useMemo by moving to useEffect pattern
- Fix useMediaQuery SSR crash by guarding window.matchMedia
- Fix TimerContext race condition with multiple timers using ref-counted Set
- Fix validateTimerConfig dropping field name prefix from Zod error messages
- Fix CSS typo textbase → text-base in TimerProgressIndicator
- Stabilize useStopwatch callbacks with refs and fix misleading restart deps
- Decouple TIMER_TYPE_ICONS from enums.ts into separate UI file
- Extract repeated onStop pattern in ComplexTimer into shared callbacks
- Consolidate enum imports to canonical @/lib/enums source
- Simplify Timer.animationFrameId type to number | null
- Remove duplicate getArrowByType function, stray JSX whitespace, let→const
- Rename CardProps→TimerCardProps to avoid shadowing shadcn types
- Remove dead Sounds component and its story
- Add TimerProvider wrapper utility for hook tests
- Document Stopwatch.stop() 100ms threshold rationale
