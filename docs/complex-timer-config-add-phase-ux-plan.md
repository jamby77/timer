# Complex Timer Config Form: Add Phase Modal/Sheet UX Plan

## Goal
Remove the current “click Edit to see configurable fields” pattern for complex timer phases.

Replace it with an “Add phase” flow similar to the base configure page pattern:
- On desktop: modal dialog.
- On mobile/tablet: bottom drawer.

The "add" flow should let the user:
- Choose the phase type.
- Edit all phase fields before inserting.
- Choose insertion position via actions:
  - Cancel
  - Add at the end
  - Add at the start

## Current State (Findings)
- Complex timer phases are rendered in `src/components/configure/components/ComplexFieldsForm.tsx`.
- Phase configuration fields are currently *gated* behind an “Edit” icon toggle (`editingPhaseId`).
- “Add Phase” currently appends a default countdown phase immediately (no modal/sheet).
- The base configure page uses `TimerConfig` (`Dialog` on desktop, `Drawer` on smaller screens) to host the configuration form.

## Desired UX
### Entry point
- Replace current “Add Phase” button behavior.
- Clicking “Add Phase” opens a modal/drawer with:
  - Timer type selector for the phase.
  - All fields for that phase type visible and editable.
  - Phase name input.

### Editing existing phases
- Clicking the existing per-phase Edit icon opens the same dialog/drawer for editing that phase.
- Edit dialog footer actions:
  - Cancel: close and discard.
  - Save: persist updates to the existing phase.

### Actions
The modal/drawer footer actions depend on whether phases already exist:

If there are 0 phases:
- Cancel: close and discard.
- Add: inserts the first phase (equivalent to “add at start”).

If there is at least 1 phase:
- Cancel: close and discard.
- Add at the end: insert as the last phase.
- Add at the start: insert as the first phase.

## Proposed Implementation
### 1) New component(s)
- Add a new component to implement the responsive modal/drawer wrapper pattern used by `TimerConfig`:
  - `ComplexPhaseAddDialog` (name tentative)

Responsibilities:
- Own open/close state (controlled by parent `ComplexFieldsForm`).
- Render `Dialog` on desktop and `Drawer` on small screens (reuse `useMediaQuery`).
- Provide the conditional footer actions (single Add when there are 0 phases; Add at start/end when there is at least 1 phase).

Parent integration:
- `ComplexFieldsForm` passes `open` / `onCancel`.
- `ComplexFieldsForm` passes callbacks for affirmative actions, e.g.:
  - `onAddAtStart(draft)`
  - `onAddAtEnd(draft)`
- For edit mode, `ComplexFieldsForm` passes a save callback, e.g.:
  - `onSave(phaseId, draft)`
- `ComplexPhaseAddDialog` owns the draft state and calls the appropriate callback with the draft payload when the user confirms.

### 2) New “phase draft” state
In `ComplexPhaseAddDialog`:
- Maintain draft local state while modal is open:
  - `draftType: TimerType` (excluding `COMPLEX`)
  - `draftConfig: PhaseTimerConfig` (created via existing `createDefaultPhaseConfig`)
  - `draftName: string` (generated via `generateTimerName`)
- `ComplexFieldsForm` should not own draft state; it only receives the final draft via the callback and performs insertion.

Edit mode:
- `ComplexPhaseAddDialog` supports an edit mode that initializes draft state from an existing `ComplexPhase`.
- On Save, it calls `onSave(phaseId, draft)`.

Type switching:
- When changing type, reset `draftConfig` to defaults for that type.
- Only overwrite `draftName` if the user didn’t manually edit the name (same heuristic used elsewhere).

### 3) Insertion logic
Add helper in `ComplexFieldsForm`:
- `insertPhase(position: 'start' | 'end', phase: ComplexPhase)`

Rules:
- `start`: new phase becomes order `0`, existing phases shift +1.
- `end`: new phase becomes last; set order to `phases.length`.
- Always re-normalize `order` fields to `[0..n-1]` after insertion.

Disabled rule enforcement:
- When `phases.length === 0`, show a single affirmative action “Add” that inserts the first phase.
- When `phases.length > 0`, show “Add at the start” and “Add at the end”.

### 4) Editing existing phases (scope)
This change request includes editing existing phases via the existing per-phase Edit icon.

Implementation:
- Remove the inline `editingPhaseId` gating and do not render phase-specific field sets inline.
- Keep cards as a summary row (name/type) with actions (Move up/down, Edit, Delete).
- Use the dialog/drawer for both:
  - Adding a phase
  - Editing a phase

### 5) Validation and save behavior
- No new validation is introduced inside the modal beyond basic field constraints already encoded in inputs.
- Existing `processTimerConfig` / `validateTimerConfig` should remain the authoritative validation on “Start Timer” / “Save as preset”.

### 6) Tests
- Add tests for insertion behavior:
  - Inserting at start places new phase at index 0 and reorders others.
  - Inserting at end places new phase at last index.
  - When there are 0 phases, the dialog shows a single “Add” action (and does not show “Add at start/end”).

- Add tests for editing behavior:
  - Edit opens dialog with phase values prefilled.
  - Save updates the targeted phase and closes the dialog.

No mocking.

## Open Questions (need your confirmation)
- Should the modal/drawer include the “overall options” (auto-advance, overall limit)?
  - NO: overall options are edited at the main complex timer config level (not per-phase, not in the add-phase dialog).
