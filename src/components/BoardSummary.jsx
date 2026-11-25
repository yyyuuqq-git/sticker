import React from "react";

export default function BoardSummary({
  boardTitle,
  rewardText,
  currentCount,
  goalCount,
  isGoalReached,
}) {
  const percentage = Math.min(100, Math.round((currentCount / Math.max(1, goalCount)) * 100));

  return (
    <>
      <div className="summary-card">
        <h2 id="board-title-card" className="board-title">
          {boardTitle || "스티커판"}
        </h2>
        <div id="board-code-display" className="board-code-display">
          보상: {rewardText || "소원 들어주기!"}
        </div>

        <div className="progress-info">
          <span>칭찬 스티커 모으기</span>
          <span id="progress-text" className="progress-count">
            {currentCount} / {goalCount} 개
          </span>
        </div>

        <div className="progress-bar-container">
          <div
            id="progress-bar-fill"
            className="progress-bar-fill"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {isGoalReached && (
        <div id="celebration-banner" className="celebration-banner">
          <div className="celebration-icon">🎉</div>
          <div className="celebration-info">
            <h3 className="celebration-title">축하합니다! 목표를 모두 달성했어요!</h3>
            <p id="celebration-reward" className="celebration-reward">
              {rewardText ? `보상: ${rewardText}` : "수고 많았어요! 따뜻한 칭찬과 사랑을 전해주세요!"}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
