export default function SeasoningModal({ item, onChoose, onCancel }) {
  if (!item) return null;
  return (
    <div className="overlay" onClick={onCancel}>
      <div className="seasoning-sheet" onClick={(e) => e.stopPropagation()}>
        <p className="seasoning-sheet__title">{item.name} の味を選んでください</p>
        <div className="seasoning-sheet__options">
          <button className="btn btn-secondary" onClick={() => onChoose("塩")}>
            塩
          </button>
          <button className="btn btn-secondary" onClick={() => onChoose("たれ")}>
            たれ
          </button>
        </div>
        <button className="btn btn-ghost" onClick={onCancel}>
          キャンセル
        </button>
      </div>
    </div>
  );
}
