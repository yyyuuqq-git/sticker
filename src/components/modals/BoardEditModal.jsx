import React, { useState, useEffect } from "react";

export default function BoardEditModal({
  isOpen,
  board,
  isEditorMode,
  onClose,
  onSave,
}) {
  const [title, setTitle] = useState("");
  const [targetCount, setTargetCount] = useState(30);
  const [reward, setReward] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (board) {
      setTitle(board.title || "스티커판");
      setTargetCount(board.goal_count || 30);
      setReward(board.reward_text || "");
    }
  }, [board, isOpen]);

  if (!isOpen || !board) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isEditorMode) return;
    setIsSaving(true);
    await onSave({
      ...board,
      title: title.trim() || "스티커판",
      goal_count: Math.max(1, parseInt(targetCount, 10) || 30),
      reward_text: reward.trim(),
    });
    setIsSaving(false);
    onClose();
  };

  return (
    <div id="modal-board-edit" className="modal-overlay">
      <div className="modal-content">
        <h3 className="modal-title">⚙️ 칭찬판 상세 수정</h3>
        <p className="modal-desc">
          칭찬판의 제목, 목표 개수, 보상을 수정합니다.{" "}
          <span className="badge-lock">(여자친구 권한 필요)</span>
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginTop: "16px" }}>
            <label htmlFor="edit-board-title">칭찬판 제목</label>
            <input
              type="text"
              id="edit-board-title"
              className="editor-only-field"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={!isEditorMode}
              required
            />
          </div>

          <div className="form-group" style={{ marginTop: "12px" }}>
            <label htmlFor="edit-board-target-count">목표 개수 (20 ~ 50)</label>
            <input
              type="number"
              id="edit-board-target-count"
              className="editor-only-field"
              min="1"
              max="100"
              value={targetCount}
              onChange={(e) => setTargetCount(e.target.value)}
              disabled={!isEditorMode}
              required
            />
          </div>

          <div className="form-group" style={{ marginTop: "12px" }}>
            <label htmlFor="edit-board-reward">달성 완료 보상</label>
            <input
              type="text"
              id="edit-board-reward"
              className="editor-only-field"
              value={reward}
              onChange={(e) => setReward(e.target.value)}
              disabled={!isEditorMode}
            />
          </div>

          <div className="modal-actions" style={{ marginTop: "24px" }}>
            <button
              type="button"
              id="btn-board-edit-close"
              className="btn btn-secondary"
              onClick={onClose}
            >
              닫기
            </button>
            {isEditorMode && (
              <button
                type="submit"
                id="btn-board-edit-save"
                className="btn btn-primary"
                disabled={isSaving}
              >
                {isSaving ? "저장 중..." : "저장"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
