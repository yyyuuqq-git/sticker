import React, { useState } from "react";

export default function CreateBoardModal({
  isOpen,
  onClose,
  onCreate,
}) {
  const [title, setTitle] = useState("");
  const [targetCount, setTargetCount] = useState(30);
  const [reward, setReward] = useState("소원 들어주기! 🎁");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setIsSubmitting(true);
    await onCreate({
      title: title.trim(),
      goal_count: Math.max(1, parseInt(targetCount, 10) || 30),
      reward_text: reward.trim() || "소원 들어주기!",
    });
    setIsSubmitting(false);
    setTitle("");
    onClose();
  };

  return (
    <div id="modal-share" className="modal-overlay">
      <div className="modal-content">
        <h3 className="modal-title">🆕 새 스티커판 만들기</h3>
        <p className="modal-desc">
          새로 만들 스티커판의 제목, 목표 개수, 보상을 설정합니다.{" "}
          <span className="badge-lock">(여자친구 권한 필요)</span>
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginTop: "16px" }}>
            <label htmlFor="input-create-board-title">스티커판 제목</label>
            <input
              type="text"
              id="input-create-board-title"
              placeholder="스티커판 이름 (예: 욱이의 착한 일 판 🌙)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group" style={{ marginTop: "12px" }}>
            <label htmlFor="input-create-board-target">목표 개수 (20 ~ 50)</label>
            <input
              type="number"
              id="input-create-board-target"
              min="1"
              max="100"
              value={targetCount}
              onChange={(e) => setTargetCount(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ marginTop: "12px" }}>
            <label htmlFor="input-create-board-reward">달성 완료 보상</label>
            <input
              type="text"
              id="input-create-board-reward"
              placeholder="예: 맛있는 디저트 데이트! 🍦"
              value={reward}
              onChange={(e) => setReward(e.target.value)}
            />
          </div>

          <div className="modal-actions" style={{ marginTop: "24px" }}>
            <button
              type="button"
              id="btn-share-close"
              className="btn btn-secondary"
              onClick={onClose}
            >
              닫기
            </button>
            <button
              type="submit"
              id="btn-create-board"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "생성 중..." : "생성 및 이동"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
