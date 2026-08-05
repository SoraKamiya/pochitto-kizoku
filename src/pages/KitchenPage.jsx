import { useEffect, useState } from "react";
import { collection, doc, onSnapshot, orderBy, query, updateDoc } from "firebase/firestore";
import { db } from "../firebase.js";
import KitchenTicket from "../components/KitchenTicket.jsx";
import "./KitchenPage.css";

// Hardcoded on purpose (see docs/SPEC.md) — this is a shared-tablet PIN, not
// real auth. Change it here directly if it needs to rotate.
const KITCHEN_PASSWORD = "torikizoku";
const AUTH_KEY = "pochi_kitchen_auth";

export default function KitchenPage() {
  const [authed, setAuthed] = useState(() => localStorage.getItem(AUTH_KEY) === "true");
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState("");
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!authed) return;
    const ordersQuery = query(collection(db, "orders"), orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
      setOrders(snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })));
    });
    return unsubscribe;
  }, [authed]);

  function handleLogin(e) {
    e.preventDefault();
    if (passwordInput === KITCHEN_PASSWORD) {
      localStorage.setItem(AUTH_KEY, "true");
      setAuthed(true);
      setAuthError("");
    } else {
      setAuthError("パスワードが違います");
    }
  }

  async function handleAdvance(order, nextStatus) {
    await updateDoc(doc(db, "orders", order.id), { status: nextStatus });
  }

  if (!authed) {
    return (
      <div className="kitchen-login">
        <form onSubmit={handleLogin} className="kitchen-login__form">
          <h1>厨房ディスプレイ</h1>
          <input
            type="password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            placeholder="パスワード"
            autoFocus
          />
          {authError && <p className="kitchen-login__error">{authError}</p>}
          <button type="submit" className="btn btn-primary">
            入室
          </button>
        </form>
      </div>
    );
  }

  const activeOrders = orders.filter((order) => order.status !== "done");
  const doneOrders = orders.filter((order) => order.status === "done");

  return (
    <div className="kitchen-page">
      <header className="kitchen-page__header">
        <h1>厨房ディスプレイ</h1>
      </header>

      <section className="kitchen-page__section">
        {activeOrders.length === 0 ? (
          <p className="kitchen-page__empty">現在、注文はありません</p>
        ) : (
          <div className="kitchen-page__grid">
            {activeOrders.map((order) => (
              <KitchenTicket key={order.id} order={order} onAdvance={handleAdvance} />
            ))}
          </div>
        )}
      </section>

      {doneOrders.length > 0 && (
        <section className="kitchen-page__section kitchen-page__section--done">
          <h2>完了済み</h2>
          <div className="kitchen-page__grid">
            {doneOrders.map((order) => (
              <KitchenTicket key={order.id} order={order} onAdvance={handleAdvance} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
