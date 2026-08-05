# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

"ポチッと貴族" is a portfolio (self-training) web app simulating a touch-panel order system for a
yakitori izakaya, modeled after chains like 鳥貴族. QR code at each table → order screen → order
lands in Firestore → kitchen display reacts in real time. This is a solo learning project, not a
production POS — scope is deliberately narrow (see "Explicit non-goals" below).

**The full spec lives in `docs/SPEC.md` — read it before implementing any screen.** This file
only captures the cross-cutting rules and pitfalls that aren't obvious from re-reading the spec
once.

Two project-specific Claude Code skills live under `.claude/skills/` and should fire on relevant
requests automatically: `menu-item` (adding/editing/sold-out toggling menu items) and
`verify-and-deploy` (cross-screen manual check + Firebase deploy checklist, since this project has
no automated tests).

## Current status

No application code exists yet — only `docs/SPEC.md`. The project has not been scaffolded with
Vite. When scaffolding for the first time, use React + Vite (JavaScript, not TypeScript — the spec
writes all data shapes as plain JS object literals) and `react-router-dom` for routing.

## Commands

Once scaffolded, this will be a standard Vite project:

```bash
npm run dev       # local dev server
npm run build     # production build
npm run preview   # preview the production build locally
firebase deploy   # deploy to Firebase Hosting (requires firebase-tools + `firebase login`)
```

There is no test runner in the spec — this project has no automated tests. Verify behavior by
running the app and exercising the three routes manually (see "Manual verification" below).

## Architecture

Single React app, three routes, no shared layout beyond the router:

| Route | Screen | Notes |
|---|---|---|
| `/order?table={token}` | Customer ordering | Reads `table` query param, resolves it against a hardcoded `TABLES` token→number map |
| `/history` | Customer order history | Reads purely from `localStorage`, no Firestore reads |
| `/kitchen` | Kitchen display | Password-gated (hardcoded password), Firestore `onSnapshot` listener |

**Data flow is one-directional and asymmetric:**
- Customer screen writes one `orders` doc per confirmed cart → Firestore.
- Kitchen screen subscribes to `orders` via `onSnapshot` and writes back only `status` updates.
- Customer never reads order status back. `/history` is a local receipt log, not a live view of
  kitchen state — do not wire it to Firestore.

**State management is deliberately minimal:** `useState`/`useEffect` only, no Redux/Zustand/Context
library. Cart state persists through `localStorage`, not through Firestore — the cart is a client
concept, not a Firestore concept. Firestore only exists once a cart is confirmed as an order.

**Menu and table data are hardcoded in source**, not fetched from Firestore. There is intentionally
no admin UI or CMS. When asked to "add a menu item" or "add a table," edit the hardcoded
`TABLES`/menu JS objects directly — do not build a database-backed CRUD path for these unless the
spec changes.

## Data model (Firestore)

Single collection: `orders`. One document = one confirmed cart (all cart line items merged into
one doc's `items` array), not one document per line item.

```js
{
  tableToken: "xR7k2m",
  tableNumber: 1,
  items: [{ itemId, name, price, quantity, seasoning }], // seasoning only present if hasSeasoningOption
  totalPrice: 860,
  status: "pending", // "pending" -> "cooking" -> "done", one-directional
  createdAt: <Firestore Timestamp>,
}
```

Kitchen display orders by `createdAt` ascending (oldest first), un-grouped by table — one ticket
per order document, not per table.

## Key constraints / things easy to get wrong

- **Firestore security rules are `allow read, write: if true` on purpose.** This is a deliberate
  portfolio-scope decision, not an oversight — do not "fix" it by adding Firebase Auth unless
  explicitly asked to change scope.
- **Kitchen auth is a hardcoded password check, client-side only**, persisted so the device isn't
  re-prompted (shared-tablet assumption). It is not real security; don't build session/token
  infrastructure around it.
- **Cart is not cleared after order confirmation.** This is intentional — the cart list doubles as
  the running tab shown on `/history`. Clearing it on order would break the history feature.
- **`done` orders are archived, not deleted or hidden.** Kitchen screen needs a visible
  "completed" section, not a filter that removes them from the UI entirely.
- **Table tokens and menu items are static.** There is no dynamic token generation, no menu CRUD —
  don't add persistence layers for these.
- Images referenced by menu items live in `public/images/` and are always referenced by root-
  relative path (e.g. `/images/momo.jpg`). No external URLs, no Firebase Storage.

## Explicit non-goals (do not implement)

- Payment/checkout processing (totals are informational only)
- Cooking-doneness options (焼き加減) — only 塩/たれ seasoning choice exists
- Menu or table management UI
- Customer-facing live order status (customers never see pending/cooking/done)
- Firebase Auth / real login
- IP allowlisting or other device restrictions

## Manual verification

Since there's no test suite, check changes by hand across all three roles at once:
1. Open `/order?table=xR7k2m` (or another valid token) in one browser tab, add items, confirm an
   order.
2. Open `/kitchen` in another tab, log in, confirm the new ticket appears via realtime listener
   without a manual refresh, and that status transitions (`pending → cooking → done`) update live.
3. Open `/history` in the original tab and confirm the order appears with the correct running
   total.
4. Try `/order?table=doesnotexist` and confirm the "table not found" error screen renders instead
   of a crash.
