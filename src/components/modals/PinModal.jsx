import React, { useState } from "react";

export default function PinModal({ isOpen, onClose, onSubmit }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!pin.trim()) return;
    const success = onSubmit(pin.trim());
    if (!success) {
      setError(true);
    } else {
      setPin("");
      setError(false);
      onClose();
    }
  };

  return (
    <div id="modal-pin" className="modal-overlay">
      <div className="modal-content">
        <h3 className="modal-title">여자친구 권한 인증</h3>
        <p className="modal-desc">칭찬스티커를 추가하거나 제거할 수 있는 비밀번호 PIN을 입력하세요.</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="password"
              id="input-pin"
              placeholder="비밀번호 PIN 입력"
              maxLength={8}
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                setError(false);
              }}
              autoFocus
            />
            {error && (
              <span id="pin-error" className="error-text">
                비밀번호가 올바르지 않습니다.
              </span>
            )}
          </div>
          <div className="modal-actions">
            <button
              type="button"
              id="btn-pin-cancel"
              className="btn btn-secondary"
              onClick={() => {
                setPin("");
                setError(false);
                onClose();
              }}
            >
              취소
            </button>
            <button type="submit" id="btn-pin-submit" className="btn btn-primary">
              인증
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
