import React from "react";

export default function Toast({ message, visible }) {
  if (!visible && !message) return null;
  return (
    <div
      id="toast"
      className={`toast ${visible ? "show" : "hidden"}`}
      role="status"
      aria-live="polite"
    >
      {message}
    </div>
  );
}
