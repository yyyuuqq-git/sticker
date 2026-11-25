// ==========================================
// 칭찬스티커 프로젝트 설정 및 상수 모듈
// ==========================================

export const SUPABASE_URL = "https://uewhzfktonpasqjnlzhm.supabase.co";
export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVld2h6Zmt0b25wYXNxam5semhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM4ODkxNTEsImV4cCI6MjA5OTQ2NTE1MX0.-o54WOhjWM6eV-ZI6u3_fiFLh9JyqhVMdtTqVkNtp0I";

export const APP_STORAGE_PREFIX = "moon_";
export const DEFAULT_BOARD_ID = "BON_WOOK";
export const DEFAULT_THEME_COLOR = "#4A5568";

export const PRAISE_STICKERS = [
  { id: 0, name: "초승달", emoji: "🌙", src: "/stickers/moon.png", desc: "은은하고 고요한 달빛 초승달" },
  { id: 1, name: "태양", emoji: "☀️", src: "/stickers/sun.png", desc: "세상을 환히 비추는 포근한 태양" },
  { id: 2, name: "가오리", emoji: "🌊", src: "/stickers/ray.png", desc: "밤하늘 은하수를 유영하는 하늘가오리" },
  { id: 3, name: "파도", emoji: "🌊", src: "/stickers/wave.png", desc: "별빛을 머금은 잔잔한 파도" },
  { id: 4, name: "고래", emoji: "🐋", src: "/stickers/whale.png", desc: "꿈과 희망을 품은 밤하늘 고래" },
];

export const DEFAULT_PRESET_COLORS = [
  "#4A5568", "#6B46C1", "#1E3A8A", "#065F46",
  "#D97706", "#BE123C", "#3B82F6", "#111827"
];
