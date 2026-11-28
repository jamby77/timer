# Stop confirmation

Approved and implemented.

Tapping Stop on an active timer replaces its bottom action row with **End timer?**, **End** and **Keep going**. The prompt occupies the existing row height. The header, digits and progress bar keep their positions and contrast. Each choice has a 44px touch target. In portrait, Keep going occupies the original Stop location so a quick second tap dismisses the prompt safely.

The timer keeps its current state while the prompt is open. For a paused timer, use **Stay paused** in place of **Keep going**. Dismissing restores the controls. End invokes the timer’s existing Stop action and ends the whole session for a Complex timer. Natural completion or a phase transition dismisses a stale prompt. Move keyboard focus to the safe choice when the prompt opens and return it to Stop on dismissal. Escape dismisses.

[Running at 320px](stop-confirmation/running-320.png) · [Confirmation at 320px](stop-confirmation/confirm-320.png) · [Running in landscape](stop-confirmation/running-landscape.png) · [Confirmation in landscape](stop-confirmation/confirm-landscape.png)

Playwright compared the clock bounds before and after the proposed footer swap at 320 × 640 and 667 × 375. Both comparisons matched.

Verified on the running app at 320 × 640. The digits kept the same bounds, Keep going preserved playback, Stay paused preserved the paused time, and End stopped the entire Complex timer.

[Running confirmation](stop-confirmation/implemented-320.png) · [Paused confirmation](stop-confirmation/implemented-paused.png) · [Landscape confirmation](stop-confirmation/implemented-landscape.png)
