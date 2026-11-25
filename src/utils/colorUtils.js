// ==========================================
// 색상 변환 및 테마 스타일 적용 유틸리티
// ==========================================

export function hexToRgb(hex) {
  if (!hex) return { r: 74, g: 85, b: 104 };
  hex = hex.replace(/^#/, "");
  if (hex.length === 3) {
    hex = hex.split("").map((c) => c + c).join("");
  }
  const num = parseInt(hex, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

export function rgbToHex(r, g, b) {
  const toHex = (c) => {
    const hex = Math.max(0, Math.min(255, Math.round(c))).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

export function adjustColorBrightness(hex, percent) {
  const { r, g, b } = hexToRgb(hex);
  const num = percent / 100;
  const rNew = Math.round(r * (1 + num));
  const gNew = Math.round(g * (1 + num));
  const bNew = Math.round(b * (1 + num));
  return rgbToHex(
    Math.max(0, Math.min(255, rNew)),
    Math.max(0, Math.min(255, gNew)),
    Math.max(0, Math.min(255, bNew))
  );
}

export function applyThemeColor(hex) {
  if (!hex) hex = "#4A5568";
  hex = hex.toUpperCase();

  const darkHex = adjustColorBrightness(hex, -25);
  const lightHex = adjustColorBrightness(hex, 85);
  const bgStart = adjustColorBrightness(hex, 75);
  const bgEnd = adjustColorBrightness(hex, 60);
  const { r, g, b } = hexToRgb(hex);
  const glowStr = `rgba(${r}, ${g}, ${b}, 0.35)`;

  document.documentElement.style.setProperty("--stitch-primary", hex);
  document.documentElement.style.setProperty("--stitch-primary-dark", darkHex);
  document.documentElement.style.setProperty("--stitch-primary-light", lightHex);
  document.documentElement.style.setProperty("--stitch-bg-gradient-start", bgStart);
  document.documentElement.style.setProperty("--stitch-bg-gradient-end", bgEnd);
  document.documentElement.style.setProperty("--stitch-glow", glowStr);

  // 테마색 위의 글자색: WCAG 대비가 더 높은 쪽(흰색/짙은색)을 자동 선택
  const toLinear = (c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  const lum = 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
  const darkLum = 0.0144; // #1A202C
  const contrastWhite = 1.05 / (lum + 0.05);
  const contrastDark = (lum + 0.05) / (darkLum + 0.05);
  const useDarkText = contrastDark > contrastWhite;
  document.documentElement.style.setProperty("--on-primary", useDarkText ? "#1A202C" : "#FFFFFF");
  document.documentElement.style.setProperty(
    "--on-primary-hover",
    useDarkText ? "rgba(0, 0, 0, 0.12)" : "rgba(255, 255, 255, 0.2)"
  );

  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) metaTheme.setAttribute("content", hex);
}
