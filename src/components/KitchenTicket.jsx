const STATUS_LABEL = {
  pending: "未着手",
  cooking: "調理中",
  done: "完了",
};

export default function KitchenTicket({ order, onAdvance }) {
  return (
    <div className={`ticket ticket--${order.status}`}>
      <div className="ticket__header">
        <span className="ticket__table">{order.tableNumber}番卓</span>
        <span className="ticket__status">{STATUS_LABEL[order.status]}</span>
      </div>
      <ul className="ticket__items">
        {order.items.map((item, idx) => (
          <li key={idx}>
            {item.name}
            {item.seasoning ? `(${item.seasoning})` : ""} × {item.quantity}
          </li>
        ))}
      </ul>
      {order.status === "pending" && (
        <button className="btn btn-primary ticket__action" onClick={() => onAdvance(order, "cooking")}>
          調理開始
        </button>
      )}
      {order.status === "cooking" && (
        <button className="btn btn-primary ticket__action" onClick={() => onAdvance(order, "done")}>
          完成
        </button>
      )}
    </div>
  );
}
