import React from "react";

export default function Header({
  boardTitle,
  onOpenSidebar,
  onOpenColorPalette,
}) {
  return (
    <header className="app-header">
      <div className="header-left">
        <button
          id="btn-menu"
          className="btn-icon"
          title="스티커판 목록 열기"
          aria-label="스티커판 목록 열기"
          onClick={onOpenSidebar}
        >
          <span className="material-icons">menu</span>
        </button>
        <h1 id="board-title-display" className="header-title">
          {boardTitle || "스티커판"}
        </h1>
      </div>

      <div className="header-actions">
        <button
          id="btn-color-palette"
          className="btn-icon"
          title="테마 색상 변경"
          aria-label="테마 색상 변경"
          onClick={onOpenColorPalette}
        >
          <span className="material-icons">palette</span>
        </button>
      </div>
    </header>
  );
}
