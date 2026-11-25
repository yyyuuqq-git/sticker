import React, { useState, useEffect } from "react";
import { PRAISE_STICKERS } from "../../config/constants";
import { parseStickerMemo, formatDate } from "../../services/api";

export default function MemoViewModal({
  isOpen,
  slotIndex,
  stickerData,
  isEditorMode,
  onClose,
  onEditMemo,
  onRemoveSticker,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editMemoText, setEditMemoText] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (stickerData) {
      const parsed = parseStickerMemo(stickerData.memo);
      setEditMemoText(parsed.memo || "");
      setIsEditing(false);
    }
  }, [stickerData, isOpen]);

  if (!isOpen || !stickerData) return null;

  const parsed = parseStickerMemo(stickerData.memo);
  const type =
    parsed.type !== null && parsed.type >= 0
      ? parsed.type % PRAISE_STICKERS.length
      : slotIndex % PRAISE_STICKERS.length;
  const stickerItem = PRAISE_STICKERS[type] || PRAISE_STICKERS[0];

  const handleSaveEdit = async () => {
    setIsSaving(true);
    const updatedPayload = `[type:${type}] ${editMemoText.trim()}`;
    await onEditMemo(slotIndex, updatedPayload);
    setIsSaving(false);
    setIsEditing(false);
  };

  return (
    <div id="modal-memo-view" className="modal-overlay">
      <div className="modal-content">
        <h3 className="modal-title">칭찬 스티커 메모 💌</h3>

        <div style={{ textAlign: "center", margin: "12px 0" }}>
          <img
            src={stickerItem.src}
            alt={stickerItem.name}
            style={{ width: "72px", height: "72px", objectFit: "contain" }}
          />
          <div style={{ fontSize: "14px", fontWeight: "bold", marginTop: "4px" }}>
            {stickerItem.name} ({slotIndex + 1}번째 스티커)
          </div>
        </div>

        {!isEditing ? (
          <div className="memo-view-content">
            <p id="view-sticker-memo-text" className="memo-view-text">
              {parsed.memo ? parsed.memo : "작성된 칭찬 메모가 없습니다. 💖"}
            </p>
            <div className="memo-dates-container">
              {stickerData.created_at && (
                <span id="view-sticker-created-at" className="memo-view-date">
                  부착: {formatDate(stickerData.created_at)}
                </span>
              )}
              {stickerData.updated_at &&
                stickerData.updated_at !== stickerData.created_at && (
                  <span id="view-sticker-updated-at" className="memo-view-date">
                    수정: {formatDate(stickerData.updated_at)}
                  </span>
                )}
            </div>
          </div>
        ) : (
          <div id="memo-edit-area" className="form-group" style={{ marginTop: "12px" }}>
            <textarea
              id="input-memo-edit"
              rows={3}
              className="memo-textarea"
              maxLength={200}
              value={editMemoText}
              onChange={(e) => setEditMemoText(e.target.value)}
              autoFocus
            />
          </div>
        )}

        <div className="modal-actions" style={{ marginTop: "16px" }}>
          {!isEditing ? (
            <>
              {isEditorMode && (
                <>
                  <button
                    type="button"
                    id="btn-memo-remove"
                    className="btn btn-danger"
                    onClick={() => onRemoveSticker(slotIndex)}
                  >
                    스티커 떼기
                  </button>
                  <button
                    type="button"
                    id="btn-memo-edit-start"
                    className="btn btn-secondary"
                    onClick={() => setIsEditing(true)}
                  >
                    메모 수정
                  </button>
                </>
              )}
              <button
                type="button"
                id="btn-memo-view-close"
                className="btn btn-secondary"
                onClick={onClose}
              >
                닫기
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                id="btn-memo-edit-cancel"
                className="btn btn-secondary"
                onClick={() => setIsEditing(false)}
              >
                취소
              </button>
              <button
                type="button"
                id="btn-memo-edit-save"
                className="btn btn-primary"
                onClick={handleSaveEdit}
                disabled={isSaving}
              >
                {isSaving ? "저장 중..." : "저장"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
