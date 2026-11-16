# AGENTS.md

## Learned User Preferences

- User prefers creating PRs manually -- do not auto-create PRs via `gh pr create`; just provide the PR message text
- Keep `console.error` for legitimate error reporting (e.g., storage failures, wake lock failures) -- only strip debug `console.log` statements
- User is comfortable with comprehensive multi-step review-then-plan-then-implement workflows

## Learned Workspace Facts

- X-Timer is a frontend-only Next.js 16 PWA for workout/productivity timers with no backend; data lives in localStorage
- Timer types: Countdown, Stopwatch, Interval, Work/Rest, Complex (multi-phase)
- Architecture: timer classes (`Timer.ts`, `Stopwatch.ts`, `TimerManager.ts`) → React hooks (`useTimer`, `useStopwatch`, etc.) → display components
- Two main routes: `/configure` (config forms) and `/` (timer display); they communicate via localStorage + URL params (`?id=<hash>`)
- Uses pnpm as package manager
- Tech stack: React 19, TypeScript, Tailwind CSS v4, Radix UI, Zod (validation), Vitest + Storybook (testing)
- Type guards for config discrimination live in `src/types/configure.ts`: `isCountdownConfig`, `isStopwatchConfig`, `isIntervalConfig`, `isWorkRestConfig`, `isComplexConfig`
- `PhaseConfig` type alias (union of non-complex configs) is used for `ComplexPhase.config`
- Hook callbacks are stabilized via refs (`onTickRef`, `onStopRef`, etc.) to avoid recreating timer instances on every render
- `TimerContext` provides `isAnyTimerActive` for cross-component concerns like navigation hiding and wake lock
- Storage validation uses lightweight Zod schemas in `src/lib/configure/storage.ts` to guard against malformed localStorage data

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
