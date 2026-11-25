import React from "react";

export default function DeleteConfirmModal({
  isOpen,
  title = "스티커 제거",
  message = "스티커를 떼겠습니까?",
  onClose,
  onConfirm,
}) {
  if (!isOpen) return null;

  return (
    <div id="modal-delete" className="modal-overlay">
      <div className="modal-content">
        <h3 className="modal-title">{title}</h3>
        <p id="delete-confirm-text">{message}</p>
        <div className="modal-actions">
          <button
            type="button"
            id="btn-delete-cancel"
            className="btn btn-secondary"
            onClick={onClose}
          >
            아니요
          </button>
          <button
            type="button"
            id="btn-delete-confirm"
            className="btn btn-danger"
            onClick={onConfirm}
          >
            네
          </button>
        </div>
      </div>
    </div>
  );
}
