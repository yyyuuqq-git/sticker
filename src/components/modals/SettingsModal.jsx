import React, { useState, useEffect } from "react";

export default function SettingsModal({
  isOpen,
  onClose,
  isEditorMode,
  currentBoard,
  onSwitchBoard,
  onSaveSettings,
}) {
  const [switchCode, setSwitchCode] = useState("");
  const [appTitle, setAppTitle] = useState("");
  const [pin, setPin] = useState("");
  const [readerName, setReaderName] = useState("");
  const [editorName, setEditorName] = useState("");

  useEffect(() => {
    if (isOpen) {
      setAppTitle(
        (currentBoard && currentBoard.app_title) ||
          localStorage.getItem("global_app_title") ||
          "스티커판"
      );
      setPin((currentBoard && currentBoard.editor_pin) || "1234");
      setReaderName(
        localStorage.getItem("global_reader_role_name") ||
          (currentBoard && currentBoard.reader_role_name) ||
          "남자친구 모드 (조회 전용)"
      );
      setEditorName(
        localStorage.getItem("global_editor_role_name") ||
          (currentBoard && currentBoard.editor_role_name) ||
          "여자친구 모드 (부착 가능)"
      );
    }
  }, [isOpen, currentBoard]);

  if (!isOpen) return null;

  const handleSwitch = (e) => {
    e.preventDefault();
    if (!switchCode.trim()) return;
    onSwitchBoard(switchCode.trim().toUpperCase());
    setSwitchCode("");
    onClose();
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!isEditorMode) return;
    onSaveSettings({
      appTitle: appTitle.trim() || "스티커판",
      pin: pin.trim() || "1234",
      readerName: readerName.trim() || "남자친구 모드 (조회 전용)",
      editorName: editorName.trim() || "여자친구 모드 (부착 가능)",
    });
    onClose();
  };

  return (
    <div id="modal-settings" className="modal-overlay">
      <div className="modal-content scrollable">
        <h3 className="modal-title">스티커판 설정</h3>

        {/* 공유판 불러오기 */}
        <div className="settings-section">
          <h4 className="section-title">🔗 공유 스티커판 불러오기</h4>
          <form onSubmit={handleSwitch} className="input-row">
            <input
              type="text"
              id="input-switch-board"
              placeholder="불러올 코드 입력"
              style={{ textTransform: "uppercase" }}
              value={switchCode}
              onChange={(e) => setSwitchCode(e.target.value.toUpperCase())}
            />
            <button type="submit" id="btn-switch-board" className="btn btn-primary btn-sm">
              이동
            </button>
          </form>
        </div>

        <hr className="divider" />

        {/* 현재 칭찬판 수정 (편집 상태일 때만 활성화) */}
        <div className="settings-section">
          <h4 className="section-title">
            ⚙️ 칭찬판 보안 및 라벨 설정{" "}
            <span className="badge-lock">(편집 권한 필요)</span>
          </h4>

          <div className="form-group">
            <label htmlFor="edit-app-title">앱 상단 대제목 (메인 타이틀)</label>
            <input
              type="text"
              id="edit-app-title"
              className="editor-only-field"
              placeholder="예: 스티커판"
              value={appTitle}
              onChange={(e) => setAppTitle(e.target.value)}
              disabled={!isEditorMode}
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-pin">편집용 비밀번호 PIN</label>
            <input
              type="password"
              id="edit-pin"
              className="editor-only-field"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              disabled={!isEditorMode}
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-reader-name">조회 모드 명칭 (남자친구 모드)</label>
            <input
              type="text"
              id="edit-reader-name"
              className="editor-only-field"
              placeholder="기본값: 남자친구 모드 (조회 전용)"
              value={readerName}
              onChange={(e) => setReaderName(e.target.value)}
              disabled={!isEditorMode}
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-editor-name">편집 모드 명칭 (여자친구 모드)</label>
            <input
              type="text"
              id="edit-editor-name"
              className="editor-only-field"
              placeholder="기본값: 여자친구 모드 (부착 가능)"
              value={editorName}
              onChange={(e) => setEditorName(e.target.value)}
              disabled={!isEditorMode}
            />
          </div>
        </div>

        <div className="modal-actions">
          <button
            type="button"
            id="btn-settings-close"
            className="btn btn-secondary"
            onClick={onClose}
          >
            닫기
          </button>
          {isEditorMode && (
            <button
              type="button"
              id="btn-settings-save"
              className="btn btn-primary"
              onClick={handleSave}
            >
              저장
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
