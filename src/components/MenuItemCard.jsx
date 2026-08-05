import { formatYen } from "../utils/format.js";

export default function MenuItemCard({ item, onAdd }) {
  return (
    <div className={`menu-card ${item.soldOut ? "menu-card--soldout" : ""}`}>
      <div className="menu-card__image-wrap">
        <img src={item.imageUrl} alt={item.name} className="menu-card__image" />
        {item.soldOut && <span className="menu-card__badge">品切れ</span>}
      </div>
      <div className="menu-card__body">
        <p className="menu-card__name">{item.name}</p>
        <p className="menu-card__price">{formatYen(item.price)}</p>
        <button
          className="btn btn-primary menu-card__add"
          disabled={item.soldOut}
          onClick={() => onAdd(item)}
        >
          {item.soldOut ? "品切れ" : "カートに追加"}
        </button>
      </div>
    </div>
  );
}
