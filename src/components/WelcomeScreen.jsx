import React, { useState, useEffect } from "react";
import { getNextSequentialBoardCode } from "../services/api";

export default function WelcomeScreen({ onCreateBoard }) {
  const [boardId, setBoardId] = useState("BON_WOOK_1");
  const [title, setTitle] = useState("욱이의 칭찬판 🌙");
  const [targetCount, setTargetCount] = useState(30);
  const [reward, setReward] = useState("소원 들어주기! 🎁");
  const [pin, setPin] = useState("1234");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    getNextSequentialBoardCode("BON_WOOK").then((code) => {
      if (mounted && code) {
        setBoardId(code);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!boardId.trim()) return;
    setIsSubmitting(true);
    let finalCode = boardId.trim().toUpperCase();
    if (!finalCode.startsWith("BON_WOOK")) {
      finalCode = `BON_WOOK_${finalCode}`;
    }

    await onCreateBoard({
      id: finalCode,
      title: title.trim() || "스티커판",
      goal_count: Math.max(1, parseInt(targetCount, 10) || 30),
      reward_text: reward.trim() || "소원 들어주기!",
      editor_pin: pin.trim() || "1234",
    });
    setIsSubmitting(false);
  };

  return (
    <div id="welcome-screen" className="welcome-screen">
      <div className="welcome-card">
        <div className="welcome-header">
          <span className="material-icons welcome-logo-icon">auto_awesome</span>
          <h2>스티커판 시작하기</h2>
          <p>둘만의 실시간 칭찬판 정보와 비밀번호를 설정해 주세요.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="setup-board-id">공유 코드 (Board Code)</label>
            <input
              type="text"
              id="setup-board-id"
              value={boardId}
              onChange={(e) => setBoardId(e.target.value.toUpperCase())}
              style={{ textTransform: "uppercase" }}
              required
            />
            <small className="helper-text">서로 연결할 때 사용하는 코드입니다. (자동 생성됨)</small>
          </div>

          <div className="form-group">
            <label htmlFor="setup-title">칭찬판 제목</label>
            <input
              type="text"
              id="setup-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 욱이의 칭찬판 🌙"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="setup-target-count">목표 스티커 개수 (20 ~ 50)</label>
            <input
              type="number"
              id="setup-target-count"
              value={targetCount}
              onChange={(e) => setTargetCount(e.target.value)}
              min="1"
              max="100"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="setup-reward">달성 완료 보상</label>
            <input
              type="text"
              id="setup-reward"
              value={reward}
              onChange={(e) => setReward(e.target.value)}
              placeholder="예: 맛있는 디저트 데이트! 🍦"
            />
          </div>

          <div className="form-group">
            <label htmlFor="setup-pin">편집용 비밀번호 PIN</label>
            <input
              type="password"
              id="setup-pin"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              maxLength={8}
              placeholder="••••"
              required
            />
            <small className="helper-text">스티커를 붙일 때 사용할 비밀번호입니다.</small>
          </div>

          <button
            type="submit"
            id="btn-setup-submit"
            className="btn btn-primary btn-block"
            disabled={isSubmitting}
            style={{ marginTop: "20px" }}
          >
            {isSubmitting ? "생성하는 중..." : "칭찬스티커판 만들기 ✨"}
          </button>
        </form>
      </div>
    </div>
  );
}
