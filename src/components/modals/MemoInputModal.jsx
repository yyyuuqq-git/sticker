import React, { useState } from "react";
import { PRAISE_STICKERS } from "../../config/constants";

export default function MemoInputModal({
  isOpen,
  slotIndex,
  onClose,
  onSubmit,
}) {
  const [selectedType, setSelectedType] = useState(0);
  const [memo, setMemo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const memoPayload = `[type:${selectedType}] ${memo.trim()}`;
    await onSubmit(slotIndex, memoPayload);
    setIsSubmitting(false);
    setMemo("");
    onClose();
  };

  return (
    <div id="modal-memo-input" className="modal-overlay">
      <div className="modal-content scrollable" style={{ maxWidth: "440px" }}>
        <h3 className="modal-title">🌊 3D 감성 스티커 선택</h3>
        <p className="modal-desc">붙이고 싶은 귀여운 스티커를 선택해 주세요!</p>

        {/* 스티커 선택 그리드 */}
        <div id="sticker-select-grid" className="sticker-select-grid">
          {PRAISE_STICKERS.map((s) => {
            const isSelected = s.id === selectedType;
            return (
              <div
                key={s.id}
                className={`sticker-option-item ${isSelected ? "selected" : ""}`}
                onClick={() => setSelectedType(s.id)}
                title={s.desc}
              >
                <img src={s.src} alt={s.name} className="sticker-option-img" />
                <span className="sticker-option-name">{s.name}</span>
              </div>
            );
          })}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginTop: "14px" }}>
            <label
              htmlFor="input-sticker-memo"
              style={{
                fontSize: "13px",
                fontWeight: 700,
                color: "var(--text-primary)",
                marginBottom: "6px",
                display: "block",
              }}
            >
              ✍️ 칭찬 한마디 남기기
            </label>
            <textarea
              id="input-sticker-memo"
              placeholder="예: 오늘도 고생 많았어! 사랑해 💕"
              rows={2}
              className="memo-textarea"
              maxLength={200}
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              autoFocus
            />
          </div>

          <div className="modal-actions" style={{ marginTop: "16px" }}>
            <button
              type="button"
              id="btn-memo-cancel"
              className="btn btn-secondary"
              onClick={onClose}
            >
              취소
            </button>
            <button
              type="submit"
              id="btn-memo-submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "부착 중..." : "스티커 붙이기 🚀"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
