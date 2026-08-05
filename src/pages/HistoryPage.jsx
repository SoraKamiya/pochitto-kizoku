import { useMemo, useState } from "react";
import { loadHistory } from "../utils/storage.js";
import { formatYen } from "../utils/format.js";
import "./HistoryPage.css";

export default function HistoryPage() {
  const [history] = useState(loadHistory);

  const grandTotal = useMemo(
    () => history.reduce((sum, order) => sum + order.totalPrice, 0),
    [history]
  );

  return (
    <div className="history-page">
      <header className="history-page__header">
        <h1>注文履歴</h1>
      </header>

      {history.length === 0 ? (
        <p className="history-page__empty">まだ注文はありません</p>
      ) : (
        <ul className="history-page__list">
          {history.map((order, idx) => (
            <li key={idx} className="history-order">
              <p className="history-order__time">
                {new Date(order.createdAt).toLocaleString("ja-JP")}
              </p>
              <ul className="history-order__items">
                {order.items.map((item, itemIdx) => (
                  <li key={itemIdx} className="history-order__item">
                    <span>
                      {item.name}
                      {item.seasoning ? `(${item.seasoning})` : ""} × {item.quantity}
                    </span>
                    <span>{formatYen(item.price * item.quantity)}</span>
                  </li>
                ))}
              </ul>
              <p className="history-order__subtotal">小計 {formatYen(order.totalPrice)}</p>
            </li>
          ))}
        </ul>
      )}

      <footer className="history-page__footer">
        <span>お会計目安合計</span>
        <span className="history-page__grand-total">{formatYen(grandTotal)}</span>
      </footer>
    </div>
  );
}
