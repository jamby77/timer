# Linting

Run `pnpm lint` from the repository root. It invokes ESLint directly; Next.js 16 removed
`next lint`, and `next build` does not run ESLint.

`eslint.config.mjs` uses the installed Next.js Core Web Vitals and Storybook recommended flat
configurations, preserving the presets from the former `.eslintrc.json`. It excludes build,
coverage, browser-test, Storybook output, and generated service-worker files. Source stories
and tests remain included. No rules have been disabled to obtain a passing result.

## Verification on 2026-11-17

The original command failed before scanning files: `Invalid project directory provided .../lint`.
The first migrated run exposed 29 errors and one warning. These have now been fixed:

- Commit timer callback refs in layout effects, keeping callbacks current without rebuilding timers.
- Keep SoundManager in lazy state and remove the unused render-time interval manager exposure.
- Initialize browser-dependent components behind a hydration-safe ClientOnly boundary.
- Reset timer sessions and phase drafts by key, and initialize saved configuration through lazy state.
- Subscribe to touch capabilities with useSyncExternalStore.
- Reset pre-start and interval state when configuration changes; ignore callbacks from disposed timers.
- Escape quoted JSX text and name the Prettier configuration export.

Validation:

- `pnpm lint`: zero errors or warnings; Next.js and Storybook rules remain enabled.
- `pnpm test:run --no-file-parallelism`: 247 tests pass, including five new callback/configuration cases.
- All 139 Playwright E2E cases pass against the production build, including the nine PWA cases.
- `pnpm exec tsc --noEmit` and `pnpm build`: pass.
- Initial parallel test runs hit timing-sensitive assertions in existing Countdown and Work/Rest tests.
  No timing assertions were weakened; the sequential full run passes.
- React Doctor reports one browser-branch diagnostic in InstallPromptContent. Inspection confirms
  this component is mounted only after ClientOnly's hydration snapshot becomes true, so it never
  renders on the server or during the server-matching hydration render. No suppression was added.

ESLint API checks also verified generated-file exclusions, Storybook rule loading, and error
reporting for a conditional React hook in an in-memory source fixture.

To inspect a specific file, use `pnpm exec eslint path/to/file.tsx`. To produce a machine-readable
report, use `pnpm lint --format json --output-file /tmp/timer-eslint.json`.
