import { formatYen } from "../utils/format.js";

function lineKey(line) {
  return `${line.itemId}|${line.seasoning || ""}`;
}

export default function CartModal({
  open,
  cart,
  total,
  confirmOpen,
  submitting,
  onIncrement,
  onDecrement,
  onRequestOrder,
  onCancelConfirm,
  onConfirmOrder,
  onClose,
}) {
  if (!open) return null;

  return (
    <div className="overlay" onClick={onClose}>
      <div className="cart-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cart-modal__header">
          <h2>カート</h2>
          <button className="btn btn-ghost" onClick={onClose}>
            閉じる
          </button>
        </div>

        {cart.length === 0 ? (
          <p className="cart-modal__empty">カートは空です</p>
        ) : (
          <ul className="cart-modal__list">
            {cart.map((line) => (
              <li key={lineKey(line)} className="cart-line">
                <div className="cart-line__info">
                  <p className="cart-line__name">
                    {line.name}
                    {line.seasoning ? `(${line.seasoning})` : ""}
                  </p>
                  <p className="cart-line__price">{formatYen(line.price * line.quantity)}</p>
                </div>
                <div className="cart-line__qty">
                  <button className="btn btn-secondary" onClick={() => onDecrement(line)}>
                    −
                  </button>
                  <span>{line.quantity}</span>
                  <button className="btn btn-secondary" onClick={() => onIncrement(line)}>
                    +
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="cart-modal__total">
          <span>合計</span>
          <span>{formatYen(total)}</span>
        </div>

        {!confirmOpen ? (
          <button
            className="btn btn-primary cart-modal__order-btn"
            disabled={cart.length === 0}
            onClick={onRequestOrder}
          >
            注文する
          </button>
        ) : (
          <div className="confirm-bar">
            <p>この内容で注文しますか?</p>
            <div className="confirm-bar__actions">
              <button className="btn btn-secondary" onClick={onCancelConfirm} disabled={submitting}>
                いいえ
              </button>
              <button className="btn btn-primary" onClick={onConfirmOrder} disabled={submitting}>
                {submitting ? "送信中..." : "はい"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
