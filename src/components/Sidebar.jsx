import React from "react";

export default function Sidebar({
  isOpen,
  onClose,
  boards,
  currentBoardId,
  onSelectBoard,
  onOpenCreateBoard,
  onEditBoard,
  onDeleteBoard,
  isEditorMode,
  onToggleRole,
  onOpenSettings,
}) {
  return (
    <>
      <div
        id="sidebar-overlay"
        className={`sidebar-overlay ${isOpen ? "" : "hidden"}`}
        onClick={onClose}
      />

      <aside id="sidebar" className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="sidebar-title">✨ 스티커 판 목록</div>
          <button
            id="btn-sidebar-close"
            className="btn-icon"
            title="목록 닫기"
            aria-label="목록 닫기"
            onClick={onClose}
          >
            <span className="material-icons">close</span>
          </button>
        </div>

        <div className="sidebar-body">
          <div id="board-list" className="board-list">
            {boards.map((b) => {
              const isSelected = b.id === currentBoardId;
              return (
                <div
                  key={b.id}
                  className={`board-item ${isSelected ? "selected" : ""}`}
                  onClick={() => {
                    onSelectBoard(b.id);
                    onClose();
                  }}
                >
                  <div className="board-item-drag-handle" title="정렬 핸들">
                    <span className="material-icons">drag_indicator</span>
                  </div>

                  <div className="board-item-info">
                    <div className="board-item-title">{b.title || "스티커판"}</div>
                    <div className="board-item-code">코드: {b.id}</div>
                  </div>

                  <div
                    className="board-item-actions"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className="board-action-btn edit"
                      title="스티커판 수정"
                      aria-label="스티커판 수정"
                      onClick={() => onEditBoard(b)}
                    >
                      <span className="material-icons">edit</span>
                    </button>
                    <button
                      className="board-action-btn delete"
                      title="스티커판 삭제"
                      aria-label="스티커판 삭제"
                      onClick={() => onDeleteBoard(b)}
                    >
                      <span className="material-icons">delete</span>
                    </button>
                  </div>
                </div>
              );
            })}

            {boards.length === 0 && (
              <div style={{ textAlign: "center", padding: "20px", color: "#718096" }}>
                등록된 스티커판이 없어요.
              </div>
            )}
          </div>

          <button
            id="btn-add-board-sidebar"
            className="btn-add-board-sidebar"
            onClick={() => {
              onOpenCreateBoard();
              onClose();
            }}
          >
            <span className="material-icons">add</span> 새 스티커판 만들기
          </button>
        </div>

        <div className="sidebar-footer">
          <div className="sidebar-role-area">
            <button
              id="btn-toggle-role"
              className={`sidebar-role-btn ${isEditorMode ? "editor-mode" : "reader-mode"}`}
              onClick={onToggleRole}
            >
              <span id="role-icon" className="material-icons">
                {isEditorMode ? "edit" : "visibility"}
              </span>
              <span id="role-text" className="role-text">
                {isEditorMode ? "여자친구 모드 (부착 가능)" : "남자친구 모드 (조회 전용)"}
              </span>
            </button>
          </div>

          <div className="sidebar-actions-right">
            <button
              id="btn-settings"
              className="btn-icon"
              title="설정"
              aria-label="설정"
              onClick={() => {
                onOpenSettings();
                onClose();
              }}
            >
              <span className="material-icons">settings</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
