---
name: menu-item
description: Use this skill whenever the user wants to add, edit, remove, mark sold-out, or mark back-in-stock a menu item in the ポチッと貴族 order app — even for casual phrasing like "からあげ追加して" or "もも串を品切れにして" that never says "menu," "JSON," or "hardcoded." Also use when adding a new menu photo or deciding whether hasSeasoningOption should be set on an item. This project intentionally has no admin UI or database-backed CRUD for the menu (see docs/SPEC.md and CLAUDE.md) — editing the hardcoded menu array in source is the correct, intended workflow here, not a workaround, so reach for this skill instead of proposing a management UI or a Firestore-backed menu collection.
---

# Menu item management

The menu lives entirely as a hardcoded JS array in source (conventionally
`src/data/menu.js` — if the project hasn't been scaffolded yet, that's where to
create it, matching the shape in `docs/SPEC.md`). There is no database table and
no admin screen; committing a source change *is* how the menu gets updated in
this project.

## Before touching the array, gather these facts

1. **Category** — must be exactly one of the four tab labels used elsewhere in
   the app: `焼き鳥`, `サイドメニュー`, `ドリンク`, `デザート`. Typos here silently
   drop the item from every tab's filter, so copy the string from an existing
   item rather than retyping it.
2. **Id** — follow the existing `itemNNN` pattern and pick the next unused
   number. Grep the file for the id you're about to use before adding it;
   duplicate ids will collide in React `key` props and in Firestore order
   `items[].itemId`, silently corrupting whichever order references the
   colliding item.
3. **Seasoning option** — `hasSeasoningOption: true` means the customer picks
   塩/たれ when adding the item to cart. This is true for skewer-style 焼き鳥
   items and normally false for drinks, desserts, and non-skewer sides. If it's
   ambiguous for a given item, ask the user rather than guessing — getting this
   wrong either shows a pointless option on a drink or silently omits a choice
   the customer should have had.
4. **Image** — every item needs `imageUrl: "/images/<file>"` pointing at a file
   that actually exists under `public/images/`. Check with `ls public/images/`
   before wiring up the reference; a missing file just renders a broken image
   icon on a touch-panel kiosk, which is easy to miss until someone's actually
   standing at the table. If the user hasn't supplied an image yet, say so
   explicitly instead of inventing a filename that doesn't exist.
5. **soldOut** — defaults to `false` for a new item. Marking something sold out
   is just flipping this to `true`; the UI-side "can't add to cart while sold
   out" behavior is generic and doesn't need per-item code changes.

## Making the edit

Add or edit an object matching this shape (from `docs/SPEC.md`):

```js
{
  id: "item011",
  name: "からあげ",
  price: 380,
  category: "サイドメニュー",
  imageUrl: "/images/karaage.jpg",
  soldOut: false,
  hasSeasoningOption: false,
}
```

- Removing an item: delete its object outright. Don't leave a `deleted: true`
  flag or similar — there's no consumer of such a flag anywhere in the spec,
  and it would just be dead data future edits have to remember to check.
- Bulk edits (e.g. "品切れにして" for several items): confirm the exact item
  names you're matching against before editing, since name strings aren't
  guaranteed unique the way ids are — matching by id is safer once you know it.

## Sanity check after editing

- Re-read the edited section of the array and confirm every item still has all
  six fields (`id`, `name`, `price`, `category`, `imageUrl`, `soldOut`,
  `hasSeasoningOption`) — a missing field won't throw at edit time, it'll throw
  (or silently misrender) when a customer taps that tab.
- If you're not running the app right now, at least mention that the change is
  unverified visually — a typo'd category string is a common failure mode that
  only shows up when you click through the actual tab.
