const CART_KEY = "pochi_cart";
const HISTORY_KEY = "pochi_order_history";

export function loadCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export function loadHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Appends one confirmed order to the running history log. The cart itself is
// intentionally left untouched by callers (see docs/SPEC.md) — this only
// records a snapshot of what was just sent to the kitchen.
export function appendHistory(order) {
  const history = loadHistory();
  const next = [...history, order];
  localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  return next;
}
