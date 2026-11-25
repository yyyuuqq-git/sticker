import React, { useState, useEffect } from "react";
import { DEFAULT_PRESET_COLORS, DEFAULT_THEME_COLOR } from "../../config/constants";
import { hexToRgb, rgbToHex } from "../../utils/colorUtils";

export default function ColorPaletteModal({
  isOpen,
  currentColor,
  onClose,
  onApply,
}) {
  const [selectedHex, setSelectedHex] = useState(currentColor || DEFAULT_THEME_COLOR);
  const [rgb, setRgb] = useState(hexToRgb(currentColor || DEFAULT_THEME_COLOR));

  useEffect(() => {
    if (isOpen) {
      const hex = currentColor || DEFAULT_THEME_COLOR;
      setSelectedHex(hex);
      setRgb(hexToRgb(hex));
    }
  }, [isOpen, currentColor]);

  if (!isOpen) return null;

  const updateFromHex = (hex) => {
    let cleanHex = hex.trim();
    if (!cleanHex.startsWith("#")) cleanHex = "#" + cleanHex;
    setSelectedHex(cleanHex.toUpperCase());
    if (/^#[0-9A-Fa-f]{6}$/.test(cleanHex)) {
      setRgb(hexToRgb(cleanHex));
    }
  };

  const updateFromRgb = (rVal, gVal, bVal) => {
    const clampedR = Math.max(0, Math.min(255, parseInt(rVal, 10) || 0));
    const clampedG = Math.max(0, Math.min(255, parseInt(gVal, 10) || 0));
    const clampedB = Math.max(0, Math.min(255, parseInt(bVal, 10) || 0));
    setRgb({ r: clampedR, g: clampedG, b: clampedB });
    setSelectedHex(rgbToHex(clampedR, clampedG, clampedB));
  };

  const handleApply = () => {
    const finalHex = /^#[0-9A-Fa-f]{6}$/.test(selectedHex)
      ? selectedHex
      : rgbToHex(rgb.r, rgb.g, rgb.b);
    onApply(finalHex);
    onClose();
  };

  const handleReset = () => {
    updateFromHex(DEFAULT_THEME_COLOR);
  };

  return (
    <div id="modal-color-palette" className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: "420px", padding: "22px" }}>
        <h3 className="modal-title">
          🎨 테마 색상 설정 (RGB 팔레트){" "}
          <span className="badge-lock">(편집 권한 필요)</span>
        </h3>
        <p className="modal-desc">
          원하는 RGB 색상을 선택하거나 슬라이더를 조절하여 테마를 꾸며보세요!
        </p>

        {/* 실시간 색상 미리보기 박스 */}
        <div
          id="color-preview-box"
          className="color-preview-box"
          style={{ backgroundColor: selectedHex }}
        >
          <input
            type="text"
            id="color-preview-text"
            className="color-preview-text color-preview-input"
            value={selectedHex}
            onChange={(e) => updateFromHex(e.target.value)}
            maxLength={7}
            spellCheck="false"
            autoComplete="off"
            aria-label="16진수 색상 코드 직접 입력"
          />
        </div>

        {/* 1. 추천 대표 프리셋 색상 */}
        <div className="color-preset-section">
          <label className="section-subtitle">✨ 추천 테마 색상</label>
          <div className="preset-grid">
            {DEFAULT_PRESET_COLORS.map((hex) => (
              <button
                key={hex}
                type="button"
                className="color-preset-btn"
                style={{ backgroundColor: hex }}
                title={hex}
                onClick={() => updateFromHex(hex)}
              />
            ))}
          </div>
        </div>

        {/* 2. RGB 슬라이더 및 커스텀 피커 */}
        <div className="rgb-controls-section">
          <div className="rgb-slider-group">
            <div className="rgb-slider-label">
              <span>
                <span style={{ color: "#EF4444", fontWeight: "bold" }}>R</span> (Red)
              </span>
              <input
                type="number"
                id="val-r"
                className="rgb-num-input"
                min="0"
                max="255"
                value={rgb.r}
                onChange={(e) => updateFromRgb(e.target.value, rgb.g, rgb.b)}
                aria-label="Red 값 (0~255)"
              />
            </div>
            <input
              type="range"
              id="range-r"
              min="0"
              max="255"
              value={rgb.r}
              onChange={(e) => updateFromRgb(e.target.value, rgb.g, rgb.b)}
              className="rgb-slider slider-red"
            />
          </div>

          <div className="rgb-slider-group">
            <div className="rgb-slider-label">
              <span>
                <span style={{ color: "#10B981", fontWeight: "bold" }}>G</span> (Green)
              </span>
              <input
                type="number"
                id="val-g"
                className="rgb-num-input"
                min="0"
                max="255"
                value={rgb.g}
                onChange={(e) => updateFromRgb(rgb.r, e.target.value, rgb.b)}
                aria-label="Green 값 (0~255)"
              />
            </div>
            <input
              type="range"
              id="range-g"
              min="0"
              max="255"
              value={rgb.g}
              onChange={(e) => updateFromRgb(rgb.r, e.target.value, rgb.b)}
              className="rgb-slider slider-green"
            />
          </div>

          <div className="rgb-slider-group">
            <div className="rgb-slider-label">
              <span>
                <span style={{ color: "#3B82F6", fontWeight: "bold" }}>B</span> (Blue)
              </span>
              <input
                type="number"
                id="val-b"
                className="rgb-num-input"
                min="0"
                max="255"
                value={rgb.b}
                onChange={(e) => updateFromRgb(rgb.r, rgb.g, e.target.value)}
                aria-label="Blue 값 (0~255)"
              />
            </div>
            <input
              type="range"
              id="range-b"
              min="0"
              max="255"
              value={rgb.b}
              onChange={(e) => updateFromRgb(rgb.r, rgb.g, e.target.value)}
              className="rgb-slider slider-blue"
            />
          </div>

          <div className="color-picker-input-row">
            <label
              htmlFor="input-custom-color"
              style={{
                fontSize: "13px",
                fontWeight: "bold",
                color: "var(--text-primary)",
              }}
            >
              🎨 직접 선택:
            </label>
            <input
              type="color"
              id="input-custom-color"
              value={
                /^#[0-9A-Fa-f]{6}$/.test(selectedHex) ? selectedHex : DEFAULT_THEME_COLOR
              }
              onChange={(e) => updateFromHex(e.target.value)}
              className="color-input-field"
            />
          </div>
        </div>

        <div
          className="modal-actions"
          style={{
            marginTop: "18px",
            display: "flex",
            justifyContent: "space-between",
            gap: "8px",
          }}
        >
          <button
            type="button"
            id="btn-color-reset"
            className="btn btn-secondary btn-sm"
            onClick={handleReset}
          >
            기본값 복원
          </button>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="button"
              id="btn-color-close"
              className="btn btn-secondary"
              onClick={onClose}
            >
              닫기
            </button>
            <button
              type="button"
              id="btn-color-apply"
              className="btn btn-primary"
              onClick={handleApply}
            >
              적용하기 🎨
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
