---
name: verify-and-deploy
description: Use this skill whenever the user asks to verify, test, check, confirm, or deploy the ポチッと貴族 order app — including casual phrasing like "動作確認して", "厨房に反映されるか見て", "本番に上げて", "デプロイして", even for a change touching only one of the three screens. Because this project has no automated test suite (see CLAUDE.md), this manual cross-screen checklist plus the Firebase deploy steps IS the actual verification and release process for this codebase — don't substitute a build-only check or skip straight to `firebase deploy` without it, since the one bug class this app is most exposed to (realtime sync breaking between the customer screen and the kitchen screen) is invisible from a single-screen check or a green build.
---

# Cross-screen verification and Firebase deploy

This app's core risk isn't "does it build," it's "does an order placed on one
screen actually show up, live, on another." The three screens
(`/order`, `/history`, `/kitchen`) are only loosely coupled through Firestore,
so a change that looks correct on one screen in isolation can still break the
realtime handoff. Always check across screens together, not one at a time.

## 1. Local verification (do this before every deploy)

Run `npm run dev`, then open these in separate tabs/windows so you can watch
them simultaneously:

1. **`/order?table=xR7k2m`** (or any token from the hardcoded `TABLES` map) —
   add a few items, including at least one item with `hasSeasoningOption:
   true` so the seasoning picker is exercised, confirm the cart total, and
   place the order. Confirm the "ご注文を承りました" toast appears.
2. **`/order?table=doesnotexist`** — confirm the "table not found" error
   screen renders instead of a blank page or crash. This is the one input
   validation path in the whole app; it's cheap to check and easy to regress.
3. **`/kitchen`** — log in with the hardcoded password, and confirm the order
   from step 1 appeared **without reloading the page** (this is the actual
   point of `onSnapshot` — if you have to refresh to see it, the realtime
   listener is broken, not just slow). Click through `pending → cooking →
   done` and confirm each transition is reflected immediately, and that a
   `done` ticket moves to a completed section rather than disappearing.
4. **`/history`** (back in the original tab) — confirm the order you placed
   in step 1 appears with correct item names/quantities and that the running
   total at the bottom includes it. Reload the page and confirm it's still
   there (this is the `localStorage` persistence check).

If any of these four checks weren't possible to run (no browser access, no
Firebase project configured yet, etc.), say so explicitly rather than
reporting the change as verified — a passing build or a passing lint is not
evidence any of this actually works.

## 2. Build check

```bash
npm run build
```

A failing build blocks deploy entirely, so catch it here rather than at
Firebase's end.

## 3. Firebase deploy

```bash
firebase login          # only needed once per machine
firebase use <project-id>   # confirm you're pointed at the right Firebase project
firebase deploy
```

- If Firestore security rules changed, deploy them explicitly and don't rely
  on `firebase deploy` picking up rules by accident:
  `firebase deploy --only firestore:rules,hosting`.
- Remember the rules are intentionally `allow read, write: if true` for this
  portfolio project (see CLAUDE.md) — don't "tighten" them as part of a deploy
  unless the user has explicitly asked to change that scope.

## 4. Post-deploy smoke test

Repeat step 1's checklist against the live Hosting URL, not just localhost —
Firebase config/env differences (wrong project id, rules not deployed, etc.)
are a common source of "works locally, breaks in prod" for exactly this kind
of Firestore-backed app.
