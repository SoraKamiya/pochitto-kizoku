import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase.js";
import { TABLES } from "../data/tables.js";
import { CATEGORIES, MENU } from "../data/menu.js";
import { loadCart, saveCart, appendHistory } from "../utils/storage.js";
import MenuItemCard from "../components/MenuItemCard.jsx";
import SeasoningModal from "../components/SeasoningModal.jsx";
import CartModal from "../components/CartModal.jsx";
import Toast from "../components/Toast.jsx";
import "./OrderPage.css";

function lineKey(itemId, seasoning) {
  return `${itemId}|${seasoning || ""}`;
}

export default function OrderPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("table");
  const tableNumber = token ? TABLES[token] : undefined;

  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]);
  const [cart, setCart] = useState(loadCart);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [pendingSeasoningItem, setPendingSeasoningItem] = useState(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    saveCart(cart);
  }, [cart]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  const cartCount = useMemo(
    () => cart.reduce((sum, line) => sum + line.quantity, 0),
    [cart]
  );
  const cartTotal = useMemo(
    () => cart.reduce((sum, line) => sum + line.price * line.quantity, 0),
    [cart]
  );

  if (!tableNumber) {
    return (
      <div className="error-screen">
        <h1>この卓は見つかりません</h1>
        <p>QRコードを読み直すか、店員にお声がけください。</p>
      </div>
    );
  }

  function addToCart(item, seasoning) {
    setCart((prev) => {
      const targetKey = lineKey(item.id, seasoning);
      const idx = prev.findIndex((line) => lineKey(line.itemId, line.seasoning) === targetKey);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
        return next;
      }
      return [
        ...prev,
        {
          itemId: item.id,
          name: item.name,
          price: item.price,
          quantity: 1,
          ...(seasoning ? { seasoning } : {}),
        },
      ];
    });
  }

  function handleAdd(item) {
    if (item.soldOut) return;
    if (item.hasSeasoningOption) {
      setPendingSeasoningItem(item);
      return;
    }
    addToCart(item, undefined);
  }

  function handleChooseSeasoning(seasoning) {
    addToCart(pendingSeasoningItem, seasoning);
    setPendingSeasoningItem(null);
  }

  function adjustQuantity(line, delta) {
    setCart((prev) => {
      const next = prev
        .map((l) =>
          lineKey(l.itemId, l.seasoning) === lineKey(line.itemId, line.seasoning)
            ? { ...l, quantity: l.quantity + delta }
            : l
        )
        .filter((l) => l.quantity > 0);
      return next;
    });
  }

  async function handleConfirmOrder() {
    setSubmitting(true);
    try {
      const items = cart.map((line) => ({
        itemId: line.itemId,
        name: line.name,
        price: line.price,
        quantity: line.quantity,
        ...(line.seasoning ? { seasoning: line.seasoning } : {}),
      }));
      const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

      await addDoc(collection(db, "orders"), {
        tableToken: token,
        tableNumber,
        items,
        totalPrice,
        status: "pending",
        createdAt: serverTimestamp(),
      });

      appendHistory({ items, totalPrice, createdAt: Date.now() });
      setConfirmOpen(false);
      setIsCartOpen(false);
      setToast("ご注文を承りました");
    } catch (err) {
      console.error(err);
      setToast("注文に失敗しました。もう一度お試しください");
    } finally {
      setSubmitting(false);
    }
  }

  const visibleItems = MENU.filter((item) => item.category === activeCategory);

  return (
    <div className="order-page">
      <header className="order-page__header">
        <span className="order-page__table">{tableNumber}番卓</span>
        <button className="order-page__cart-btn" onClick={() => setIsCartOpen(true)}>
          🛒
          {cartCount > 0 && <span className="order-page__cart-badge">{cartCount}</span>}
        </button>
      </header>

      <nav className="order-page__tabs">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            className={`order-page__tab ${activeCategory === category ? "order-page__tab--active" : ""}`}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </button>
        ))}
      </nav>

      <main className="order-page__grid">
        {visibleItems.map((item) => (
          <MenuItemCard key={item.id} item={item} onAdd={handleAdd} />
        ))}
      </main>

      <SeasoningModal
        item={pendingSeasoningItem}
        onChoose={handleChooseSeasoning}
        onCancel={() => setPendingSeasoningItem(null)}
      />

      <CartModal
        open={isCartOpen}
        cart={cart}
        total={cartTotal}
        confirmOpen={confirmOpen}
        submitting={submitting}
        onIncrement={(line) => adjustQuantity(line, 1)}
        onDecrement={(line) => adjustQuantity(line, -1)}
        onRequestOrder={() => setConfirmOpen(true)}
        onCancelConfirm={() => setConfirmOpen(false)}
        onConfirmOrder={handleConfirmOrder}
        onClose={() => {
          setIsCartOpen(false);
          setConfirmOpen(false);
        }}
      />

      <Toast message={toast} />
    </div>
  );
}
