// ==========================================
// 스티치 칭찬나라 JavaScript 핵심 기능 제어
// ==========================================

// 1. Supabase 연동 정보 설정
// TODO: Supabase 연동 시 아래 두 값을 채워주세요. 비어있으면 자동으로 로컬 모드로 부드럽게 작동합니다.
const SUPABASE_URL = "https://uewhzfktonpasqjnlzhm.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVld2h6Zmt0b25wYXNxam5semhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM4ODkxNTEsImV4cCI6MjA5OTQ2NTE1MX0.-o54WOhjWM6eV-ZI6u3_fiFLh9JyqhVMdtTqVkNtp0I";

let supabaseClient = null;
let isLocalMode = !SUPABASE_URL || !SUPABASE_ANON_KEY;

if (!isLocalMode) {
    try {
        if (!window.supabase) {
            throw new Error("Supabase CDN 라이브러리가 로드되지 않았습니다.");
        }
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log("Supabase 연동이 정상 활성화되었습니다.");
    } catch (e) {
        console.error("Supabase 초기화 실패. 로컬 모드로 전환합니다.", e);
        isLocalMode = true;
    }
} else {
    console.log("Supabase 설정이 비어있어 '로컬 모드(기기 브라우저 저장)'로 구동됩니다.");
}

// 달 칭찬스티커 전용 보드 판별 (채소가게, 고양이 보드 및 테스트 보드 자동 제외)
function isMoonBoard(b) {
    if (!b) return false;
    const idStr = String(typeof b === 'string' ? b : (b.id || "")).toUpperCase();
    const titleStr = String(typeof b === 'object' && b.title ? b.title : "").toUpperCase();
    if (idStr.startsWith("TEST-BOARD-") || idStr === "TEST-BOARD") return false;
    if (idStr.startsWith("CHAEDO") || idStr.includes("VEGE") || titleStr.includes("채소")) return false;
    if (idStr.startsWith("CAT") || idStr.includes("KITTY") || titleStr.includes("고양이") || titleStr.includes("야옹")) return false;
    return true;
}

let initialBoardId = localStorage.getItem("current_board_id");
if (initialBoardId && !isMoonBoard(initialBoardId)) {
    initialBoardId = "TEST-COSMIC-BOARD";
    localStorage.setItem("current_board_id", initialBoardId);
}
let currentBoardId = initialBoardId || "TEST-COSMIC-BOARD";
let currentBoard = null;
let currentStickers = [];
let isEditorMode = localStorage.getItem("is_editor") === "true";
let deleteTargetIndex = null;
let memoTargetIndex = null;
let editTargetIndex = null;

// 기본 보드 정보가 설정되지 않은 경우 신규 생성을 유도합니다.

// 3. HTML DOM 요소
const loadingSpinner = document.getElementById("loading-spinner");
const appContent = document.querySelector(".app-content");
const roleIcon = document.getElementById("role-icon");
const roleText = document.getElementById("role-text");
const btnToggleRole = document.getElementById("btn-toggle-role");
const boardTitle = document.getElementById("board-title");
const boardCodeDisplay = document.getElementById("board-code-display");
const progressCount = document.getElementById("progress-count");
const progressBarFill = document.getElementById("progress-bar-fill");
const celebrationBanner = document.getElementById("celebration-banner");
const celebrationRewardDetail = document.getElementById("celebration-reward-detail");
const stickerGrid = document.getElementById("sticker-grid");

// 사이드바 관련 요소 추가
const btnMenu = document.getElementById("btn-menu");
const sidebar = document.getElementById("sidebar");
const sidebarOverlay = document.getElementById("sidebar-overlay");
const btnSidebarClose = document.getElementById("btn-sidebar-close");
const boardListContainer = document.getElementById("board-list");
const btnAddBoardSidebar = document.getElementById("btn-add-board-sidebar");
const inputCreateBoardTitle = document.getElementById("input-create-board-title");

// 모달 및 입력 폼 요소
const modalPin = document.getElementById("modal-pin");
const inputPin = document.getElementById("input-pin");
const pinError = document.getElementById("pin-error");
const btnPinCancel = document.getElementById("btn-pin-cancel");
const btnPinSubmit = document.getElementById("btn-pin-submit");

const modalSettings = document.getElementById("modal-settings");
const inputSwitchBoard = document.getElementById("input-switch-board");
const btnSwitchBoard = document.getElementById("btn-switch-board");
const editPin = document.getElementById("edit-pin");
const editReaderName = document.getElementById("edit-reader-name");
const editEditorName = document.getElementById("edit-editor-name");
const btnSettingsClose = document.getElementById("btn-settings-close");
const btnSettingsSave = document.getElementById("btn-settings-save");

// 칭찬판 정보 수정 모달 요소 (길게 누르기 연동)
const modalBoardEdit = document.getElementById("modal-board-edit");
const editBoardTitle = document.getElementById("edit-board-title");
const editBoardTargetCount = document.getElementById("edit-board-target-count");
const editBoardReward = document.getElementById("edit-board-reward");
const btnBoardEditClose = document.getElementById("btn-board-edit-close");
const btnBoardEditSave = document.getElementById("btn-board-edit-save");

let editTargetBoard = null;

const modalDelete = document.getElementById("modal-delete");
const deleteConfirmText = document.getElementById("delete-confirm-text");
const btnDeleteCancel = document.getElementById("btn-delete-cancel");
const btnDeleteConfirm = document.getElementById("btn-delete-confirm");

const modalShare = document.getElementById("modal-share");
const btnCreateBoard = document.getElementById("btn-create-board");
const btnShareClose = document.getElementById("btn-share-close");

const welcomeScreen = document.getElementById("welcome-screen");
const setupBoardId = document.getElementById("setup-board-id");
const setupTitle = document.getElementById("setup-title");
const setupTargetCount = document.getElementById("setup-target-count");
const setupReward = document.getElementById("setup-reward");
const setupPin = document.getElementById("setup-pin");
const btnSetupSubmit = document.getElementById("btn-setup-submit");

const modalMemoInput = document.getElementById("modal-memo-input");
const inputStickerMemo = document.getElementById("input-sticker-memo");
const btnMemoCancel = document.getElementById("btn-memo-cancel");
const btnMemoSubmit = document.getElementById("btn-memo-submit");

const modalMemoView = document.getElementById("modal-memo-view");
const viewStickerMemoText = document.getElementById("view-sticker-memo-text");
const viewStickerCreatedAt = document.getElementById("view-sticker-created-at");
const viewStickerUpdatedAt = document.getElementById("view-sticker-updated-at");
const btnMemoViewClose = document.getElementById("btn-memo-view-close");

const memoEditArea = document.getElementById("memo-edit-area");
const inputEditStickerMemo = document.getElementById("input-edit-sticker-memo");
const btnMemoEditStart = document.getElementById("btn-memo-edit-start");
const btnMemoEditCancel = document.getElementById("btn-memo-edit-cancel");
const btnMemoEditSave = document.getElementById("btn-memo-edit-save");

// 공용 버튼 트리거
const btnShare = document.getElementById("btn-share");
const btnSettings = document.getElementById("btn-settings");

// ==========================================
// 4. 데이터베이스 / 로컬스토리지 통신 매핑 API
// ==========================================

// 보드 불러오기
async function apiGetBoard(boardId) {
    if (isLocalMode || !supabaseClient) {
        const localData = localStorage.getItem(`board_${boardId}`);
        if (localData) {
            return JSON.parse(localData);
        }
        return null;
    } else {
        try {
            const { data, error } = await supabaseClient
                .from("praise_boards")
                .select("*")
                .eq("id", boardId)
                .maybeSingle();
            if (error) throw error;
            if (data) {
                // 기존 캐시된 데이터와 병합하여 로컬 전용 설정(역할 이름 등) 보존
                const cached = localStorage.getItem(`board_${boardId}`);
                let mergedData = { ...data };
                if (cached) {
                    const cachedObj = JSON.parse(cached);
                    mergedData.reader_role_name = data.reader_role_name || cachedObj.reader_role_name;
                    mergedData.editor_role_name = data.editor_role_name || cachedObj.editor_role_name;
                }
                localStorage.setItem(`board_${boardId}`, JSON.stringify(mergedData));
                return mergedData;
            }
            return null;
        } catch (e) {
            console.error("보드 조회 중 서버 에러 발생, 캐시를 반환합니다.", e);
            const cached = localStorage.getItem(`board_${boardId}`);
            if (cached) return JSON.parse(cached);
            return null;
        }
    }
}

// 보드 생성 또는 수정
async function apiCreateBoard(board) {
    // 로컬 캐시에는 전체 board 객체를 항상 저장 (역할명 등 로컬 전용 필드 포함)
    localStorage.setItem(`board_${board.id}`, JSON.stringify(board));

    if (isLocalMode || !supabaseClient) {
        return { success: true };
    } else {
        try {
            // Supabase praise_boards 스키마에 존재하는 컬럼만 추출하여 전송
            const dbBoard = {
                id: board.id,
                title: board.title,
                target_count: board.target_count,
                reward_text: board.reward_text,
                editor_pin: board.editor_pin || "1234",
                reader_role_name: board.reader_role_name || "남자친구 모드 (조회 전용)",
                editor_role_name: board.editor_role_name || "여자친구 모드 (부착 가능)"
            };
            if (board.created_at) {
                dbBoard.created_at = board.created_at;
            }

            console.log("Supabase upsert 요청 데이터:", dbBoard);
            const { error } = await supabaseClient
                .from("praise_boards")
                .upsert(dbBoard);

            if (error) {
                const errMsg = `[${error.code || 'unknown'}] ${error.message || JSON.stringify(error)}`;
                console.error("Supabase 칭찬판 저장 실패:", errMsg, error);
                return { success: false, error: errMsg };
            }
            console.log("Supabase 칭찬판 저장 성공");
            return { success: true };
        } catch (e) {
            const errMsg = e.message || String(e);
            console.error("보드 생성/수정 중 예외 발생:", errMsg, e);
            return { success: false, error: errMsg };
        }
    }
}

// 보드 및 스티커 데이터베이스/로컬 캐시 완전 삭제
async function apiDeleteBoard(boardId) {
    // 1. 로컬 캐시 삭제
    localStorage.removeItem(`board_${boardId}`);
    localStorage.removeItem(`stickers_${boardId}`);

    if (isLocalMode || !supabaseClient) {
        return true;
    } else {
        try {
            // 2. Supabase DB 삭제 (ON DELETE CASCADE로 인해 스티커 데이터도 함께 삭제됨)
            const { error } = await supabaseClient
                .from("praise_boards")
                .delete()
                .eq("id", boardId);
            if (error) throw error;
            return true;
        } catch (e) {
            console.error("보드 삭제 실패", e);
            return false;
        }
    }
}

// 부착된 스티커 목록 가져오기
async function apiGetStickers(boardId) {
    if (isLocalMode || !supabaseClient) {
        const localData = localStorage.getItem(`stickers_${boardId}`);
        return localData ? JSON.parse(localData) : [];
    } else {
        try {
            const { data, error } = await supabaseClient
                .from("praise_stickers")
                .select("*")
                .eq("board_id", boardId);
            if (error) throw error;
            localStorage.setItem(`stickers_${boardId}`, JSON.stringify(data));
            return data;
        } catch (e) {
            console.error("스티커 리스트 조회 중 서버 에러 발생, 캐시를 반환합니다.", e);
            const cached = localStorage.getItem(`stickers_${boardId}`);
            return cached ? JSON.parse(cached) : [];
        }
    }
}

// 스티커 부착
async function apiAddSticker(boardId, index, memo) {
    const nowISO = new Date().toISOString();
    if (isLocalMode || !supabaseClient) {
        const current = await apiGetStickers(boardId);
        if (!current.some(s => s.sticker_index === index)) {
            current.push({ 
                board_id: boardId, 
                sticker_index: index, 
                memo: memo,
                created_at: nowISO,
                updated_at: nowISO
            });
            localStorage.setItem(`stickers_${boardId}`, JSON.stringify(current));
        }
        return true;
    } else {
        try {
            const { error } = await supabaseClient
                .from("praise_stickers")
                .insert({ 
                    board_id: boardId, 
                    sticker_index: index, 
                    memo: memo,
                    created_at: nowISO,
                    updated_at: nowISO
                });
            if (error) throw error;
            return true;
        } catch (e) {
            console.error("스티커 부착 실패", e);
            return false;
        }
    }
}

// 스티커 메모 수정
async function apiUpdateStickerMemo(boardId, index, memo) {
    const nowISO = new Date().toISOString();
    if (isLocalMode || !supabaseClient) {
        const current = await apiGetStickers(boardId);
        const sticker = current.find(s => s.sticker_index === index);
        if (sticker) {
            sticker.memo = memo;
            sticker.updated_at = nowISO;
            localStorage.setItem(`stickers_${boardId}`, JSON.stringify(current));
        }
        return true;
    } else {
        try {
            const { error } = await supabaseClient
                .from("praise_stickers")
                .update({ 
                    memo: memo, 
                    updated_at: nowISO 
                })
                .eq("board_id", boardId)
                .eq("sticker_index", index);
            if (error) throw error;
            return true;
        } catch (e) {
            console.error("스티커 메모 수정 실패", e);
            return false;
        }
    }
}

// 스티커 떼기
async function apiRemoveSticker(boardId, index) {
    if (isLocalMode || !supabaseClient) {
        let current = await apiGetStickers(boardId);
        current = current.filter(s => s.sticker_index !== index);
        localStorage.setItem(`stickers_${boardId}`, JSON.stringify(current));
        return true;
    } else {
        try {
            const { error } = await supabaseClient
                .from("praise_stickers")
                .delete()
                .eq("board_id", boardId)
                .eq("sticker_index", index);
            if (error) throw error;
            return true;
        } catch (e) {
            console.error("스티커 제거 실패", e);
            return false;
        }
    }
}

// ==========================================
// 5. 3D 해양생물 에폭시 스티커 10종 빌더
// ==========================================
const SEA_CREATURES = [
    { id: 0, name: "흰수염고래 🐳", emoji: "🐳" },
    { id: 1, name: "아기 돌고래 🐬", emoji: "🐬" },
    { id: 2, name: "장수거북이 🐢", emoji: "🐢" },
    { id: 3, name: "대왕문어 🐙", emoji: "🐙" },
    { id: 4, name: "귀요미 꽃게 🦀", emoji: "🦀" },
    { id: 5, name: "반짝 해파리 🪼", emoji: "🪼" },
    { id: 6, name: "진주 조개 🐚", emoji: "🐚" },
    { id: 7, name: "니모 열대어 🐠", emoji: "🐠" },
    { id: 8, name: "무지개 불가사리 ⭐️", emoji: "⭐️" },
    { id: 9, name: "황제 펭귄 🐧", emoji: "🐧" }
];

let selectedStickerType = 0;

function parseStickerMemo(rawMemo) {
    if (!rawMemo) return { type: null, memo: "" };
    const match = String(rawMemo).match(/^\[type:(\d+)\]\s*(.*)/s);
    if (match) {
        return { type: parseInt(match[1], 10), memo: match[2] };
    }
    return { type: null, memo: rawMemo };
}

function getSeaCreatureGraphic(type) {
    switch (type) {
        case 0: // 🐳 흰수염고래
            return `
                <defs>
                    <radialGradient id="whale-body-${type}" cx="35%" cy="35%" r="65%">
                        <stop offset="0%" stop-color="#60A5FA" />
                        <stop offset="60%" stop-color="#3B82F6" />
                        <stop offset="100%" stop-color="#1D4ED8" />
                    </radialGradient>
                    <linearGradient id="whale-belly-${type}" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stop-color="#FFFFFF" />
                        <stop offset="100%" stop-color="#DBEAFE" />
                    </linearGradient>
                </defs>
                <circle cx="50" cy="50" r="44" fill="#E0F2FE" stroke="#BAE6FD" stroke-width="2.5" />
                <path d="M 50 24 Q 46 14 40 16 M 50 24 Q 54 12 62 14" stroke="#60A5FA" stroke-width="3" stroke-linecap="round" fill="none" />
                <circle cx="40" cy="15" r="2.5" fill="#93C5FD" />
                <circle cx="62" cy="13" r="2.5" fill="#93C5FD" />
                <path d="M 20 54 C 20 34 50 32 75 44 C 84 48 88 56 78 62 C 68 68 45 68 25 64 Z" fill="url(#whale-body-${type})" stroke="#1E40AF" stroke-width="1.5" />
                <path d="M 75 48 C 82 42 88 40 92 46 C 88 52 82 52 75 52 Z" fill="url(#whale-body-${type})" />
                <path d="M 26 58 C 35 66 60 66 70 60 C 60 67 36 67 26 58 Z" fill="url(#whale-belly-${type})" />
                <circle cx="36" cy="46" r="3" fill="#1E293B" />
                <circle cx="37" cy="45" r="1" fill="#FFFFFF" />
                <path d="M 32 54 Q 38 58 44 54" stroke="#1D4ED8" stroke-width="2" stroke-linecap="round" fill="none" />
                <ellipse cx="44" cy="52" rx="3.5" ry="2.5" fill="#F472B6" opacity="0.6" />
            `;
        case 1: // 🐬 아기 돌고래
            return `
                <defs>
                    <radialGradient id="dol-body-${type}" cx="35%" cy="35%" r="65%">
                        <stop offset="0%" stop-color="#38BDF8" />
                        <stop offset="70%" stop-color="#0284C7" />
                        <stop offset="100%" stop-color="#0369A1" />
                    </radialGradient>
                </defs>
                <circle cx="50" cy="50" r="44" fill="#F0F9FF" stroke="#BAE6FD" stroke-width="2.5" />
                <path d="M 22 56 C 24 32 58 24 78 40 C 84 45 80 52 70 52 C 55 52 35 60 22 56 Z" fill="url(#dol-body-${type})" stroke="#0284C7" stroke-width="1.5" />
                <path d="M 48 30 Q 56 18 62 28 Z" fill="url(#dol-body-${type})" stroke="#0284C7" stroke-width="1" />
                <path d="M 22 56 Q 12 50 14 62 Q 20 58 22 56 Z" fill="url(#dol-body-${type})" />
                <circle cx="68" cy="42" r="3" fill="#0F172A" />
                <circle cx="69" cy="41" r="1" fill="#FFFFFF" />
                <ellipse cx="64" cy="47" rx="3" ry="2" fill="#F472B6" opacity="0.7" />
            `;
        case 2: // 🐢 장수거북이
            return `
                <defs>
                    <radialGradient id="t-shell-${type}" cx="35%" cy="35%" r="65%">
                        <stop offset="0%" stop-color="#34D399" />
                        <stop offset="70%" stop-color="#10B981" />
                        <stop offset="100%" stop-color="#047857" />
                    </radialGradient>
                    <radialGradient id="t-body-${type}" cx="35%" cy="35%" r="65%">
                        <stop offset="0%" stop-color="#A7F3D0" />
                        <stop offset="100%" stop-color="#34D399" />
                    </radialGradient>
                </defs>
                <circle cx="50" cy="50" r="44" fill="#ECFDF5" stroke="#A7F3D0" stroke-width="2.5" />
                <circle cx="70" cy="50" r="11" fill="url(#t-body-${type})" stroke="#059669" stroke-width="1.5" />
                <ellipse cx="32" cy="28" rx="10" ry="6" fill="url(#t-body-${type})" transform="rotate(-30 32 28)" />
                <ellipse cx="32" cy="72" rx="10" ry="6" fill="url(#t-body-${type})" transform="rotate(30 32 72)" />
                <ellipse cx="64" cy="28" rx="8" ry="5" fill="url(#t-body-${type})" transform="rotate(30 64 28)" />
                <ellipse cx="64" cy="72" rx="8" ry="5" fill="url(#t-body-${type})" transform="rotate(-30 64 72)" />
                <ellipse cx="46" cy="50" rx="22" ry="20" fill="url(#t-shell-${type})" stroke="#065F46" stroke-width="2" />
                <path d="M 38 42 L 48 42 L 54 50 L 48 58 L 38 58 L 34 50 Z" stroke="#A7F3D0" fill="none" stroke-width="1.8" />
                <circle cx="73" cy="47" r="2.5" fill="#064E3B" />
                <circle cx="74" cy="46" r="0.8" fill="#FFFFFF" />
            `;
        case 3: // 🐙 대왕문어
            return `
                <defs>
                    <radialGradient id="octo-body-${type}" cx="35%" cy="35%" r="65%">
                        <stop offset="0%" stop-color="#F472B6" />
                        <stop offset="70%" stop-color="#EC4899" />
                        <stop offset="100%" stop-color="#BE185D" />
                    </radialGradient>
                </defs>
                <circle cx="50" cy="50" r="44" fill="#FDF2F8" stroke="#FBCFE8" stroke-width="2.5" />
                <path d="M 26 62 Q 20 78 28 80 Q 34 76 34 64" fill="url(#octo-body-${type})" />
                <path d="M 36 64 Q 34 82 42 82 Q 48 78 46 64" fill="url(#octo-body-${type})" />
                <path d="M 54 64 Q 52 78 58 82 Q 66 82 64 64" fill="url(#octo-body-${type})" />
                <path d="M 66 64 Q 66 76 72 80 Q 80 78 74 62" fill="url(#octo-body-${type})" />
                <circle cx="50" cy="42" r="23" fill="url(#octo-body-${type})" stroke="#9D174D" stroke-width="1.5" />
                <circle cx="42" cy="40" r="4.5" fill="#0F172A" />
                <circle cx="44" cy="38" r="1.5" fill="#FFFFFF" />
                <circle cx="58" cy="40" r="4.5" fill="#0F172A" />
                <circle cx="60" cy="38" r="1.5" fill="#FFFFFF" />
                <ellipse cx="50" cy="48" rx="3.5" ry="4" fill="#831843" />
                <ellipse cx="36" cy="46" rx="4" ry="2.5" fill="#FBCFE8" opacity="0.8" />
                <ellipse cx="64" cy="46" rx="4" ry="2.5" fill="#FBCFE8" opacity="0.8" />
            `;
        case 4: // 🦀 귀요미 꽃게
            return `
                <defs>
                    <radialGradient id="crab-body-${type}" cx="35%" cy="35%" r="65%">
                        <stop offset="0%" stop-color="#F87171" />
                        <stop offset="70%" stop-color="#EF4444" />
                        <stop offset="100%" stop-color="#B91C1C" />
                    </radialGradient>
                </defs>
                <circle cx="50" cy="50" r="44" fill="#FEF2F2" stroke="#FCA5A5" stroke-width="2.5" />
                <path d="M 24 55 Q 12 52 16 68 M 26 62 Q 16 64 20 76 M 76 55 Q 88 52 84 68 M 74 62 Q 84 64 80 76" stroke="#DC2626" stroke-width="3.5" stroke-linecap="round" fill="none" />
                <path d="M 28 40 Q 16 32 18 22 Q 28 20 30 32 Z" fill="url(#crab-body-${type})" stroke="#991B1B" stroke-width="1.2" />
                <path d="M 72 40 Q 84 32 82 22 Q 72 20 70 32 Z" fill="url(#crab-body-${type})" stroke="#991B1B" stroke-width="1.2" />
                <ellipse cx="50" cy="54" rx="24" ry="17" fill="url(#crab-body-${type})" stroke="#991B1B" stroke-width="1.8" />
                <circle cx="42" cy="34" r="4.5" fill="#FFFFFF" stroke="#991B1B" stroke-width="1.5" />
                <circle cx="42" cy="34" r="2" fill="#0F172A" />
                <circle cx="58" cy="34" r="4.5" fill="#FFFFFF" stroke="#991B1B" stroke-width="1.5" />
                <circle cx="58" cy="34" r="2" fill="#0F172A" />
                <path d="M 44 58 Q 50 64 56 58" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" fill="none" />
            `;
        case 5: // 🪼 반짝 해파리
            return `
                <defs>
                    <radialGradient id="jelly-cap-${type}" cx="35%" cy="35%" r="65%">
                        <stop offset="0%" stop-color="#E9D5FF" />
                        <stop offset="60%" stop-color="#C084FC" />
                        <stop offset="100%" stop-color="#7E22CE" />
                    </radialGradient>
                </defs>
                <circle cx="50" cy="50" r="44" fill="#FAF5FF" stroke="#E9D5FF" stroke-width="2.5" />
                <path d="M 32 54 Q 28 68 34 82 M 41 56 Q 47 70 41 82 M 50 56 Q 44 70 50 82 M 59 56 Q 65 70 59 82 M 68 54 Q 64 68 70 82" stroke="#A855F7" stroke-width="2.5" stroke-linecap="round" fill="none" />
                <path d="M 22 52 C 22 28 78 28 78 52 C 68 56 60 48 50 54 C 40 48 32 56 22 52 Z" fill="url(#jelly-cap-${type})" stroke="#6B21A8" stroke-width="1.5" />
                <circle cx="42" cy="42" r="3" fill="#3B0764" />
                <circle cx="43" cy="41" r="1" fill="#FFFFFF" />
                <circle cx="58" cy="42" r="3" fill="#3B0764" />
                <circle cx="59" cy="41" r="1" fill="#FFFFFF" />
                <ellipse cx="36" cy="46" rx="3" ry="2" fill="#F472B6" opacity="0.8" />
                <ellipse cx="64" cy="46" rx="3" ry="2" fill="#F472B6" opacity="0.8" />
            `;
        case 6: // 🐚 핑크 진주조개
            return `
                <defs>
                    <radialGradient id="shell-body-${type}" cx="35%" cy="35%" r="65%">
                        <stop offset="0%" stop-color="#F472B6" />
                        <stop offset="70%" stop-color="#DB2777" />
                        <stop offset="100%" stop-color="#9D174D" />
                    </radialGradient>
                    <radialGradient id="pearl-grad-${type}" cx="30%" cy="30%" r="70%">
                        <stop offset="0%" stop-color="#FFFFFF" />
                        <stop offset="60%" stop-color="#FDE047" />
                        <stop offset="100%" stop-color="#F59E0B" />
                    </radialGradient>
                </defs>
                <circle cx="50" cy="50" r="44" fill="#FFF1F2" stroke="#FECDD3" stroke-width="2.5" />
                <path d="M 20 54 C 20 78 80 78 80 54 Z" fill="url(#shell-body-${type})" stroke="#831843" stroke-width="1.8" />
                <path d="M 20 54 C 20 24 80 24 80 54 Q 50 42 20 54 Z" fill="url(#shell-body-${type})" stroke="#831843" stroke-width="1.8" />
                <path d="M 35 50 Q 50 30 65 50 M 42 51 Q 50 32 58 51" stroke="#FBCFE8" stroke-width="1.5" stroke-linecap="round" fill="none" />
                <circle cx="50" cy="56" r="10" fill="url(#pearl-grad-${type})" stroke="#CA8A04" stroke-width="1" />
                <circle cx="47" cy="53" r="3" fill="#FFFFFF" opacity="0.9" />
            `;
        case 7: // 🐠 니모 열대어
            return `
                <defs>
                    <radialGradient id="fish-body-${type}" cx="35%" cy="35%" r="65%">
                        <stop offset="0%" stop-color="#FB923C" />
                        <stop offset="70%" stop-color="#F97316" />
                        <stop offset="100%" stop-color="#C2410C" />
                    </radialGradient>
                </defs>
                <circle cx="50" cy="50" r="44" fill="#FFF7ED" stroke="#FFEDD5" stroke-width="2.5" />
                <path d="M 72 50 L 88 36 L 84 50 L 88 64 Z" fill="url(#fish-body-${type})" stroke="#9A3412" stroke-width="1.5" />
                <ellipse cx="46" cy="50" rx="28" ry="20" fill="url(#fish-body-${type})" stroke="#9A3412" stroke-width="1.8" />
                <path d="M 40 31 C 44 38 44 62 40 69 C 45 69 49 61 47 31 Z" fill="#FFFFFF" stroke="#0F172A" stroke-width="1" />
                <path d="M 58 35 C 61 42 61 58 58 65 C 62 65 65 58 63 35 Z" fill="#FFFFFF" stroke="#0F172A" stroke-width="1" />
                <circle cx="28" cy="46" r="3.5" fill="#0F172A" />
                <circle cx="29" cy="45" r="1.2" fill="#FFFFFF" />
                <path d="M 20 52 Q 24 54 20 56" stroke="#9A3412" stroke-width="2" stroke-linecap="round" fill="none" />
            `;
        case 8: // ⭐️ 무지개 불가사리
            return `
                <defs>
                    <radialGradient id="star-body-${type}" cx="35%" cy="35%" r="65%">
                        <stop offset="0%" stop-color="#FDE047" />
                        <stop offset="70%" stop-color="#F59E0B" />
                        <stop offset="100%" stop-color="#D97706" />
                    </radialGradient>
                </defs>
                <circle cx="50" cy="50" r="44" fill="#FEFCE8" stroke="#FEF08A" stroke-width="2.5" />
                <path d="M 50 14 L 61 38 L 86 38 L 66 54 L 73 78 L 50 63 L 27 78 L 34 54 L 14 38 L 39 38 Z" fill="url(#star-body-${type})" stroke="#B45309" stroke-width="2" stroke-linejoin="round" />
                <circle cx="43" cy="45" r="3" fill="#0F172A" />
                <circle cx="44" cy="44" r="1" fill="#FFFFFF" />
                <circle cx="57" cy="45" r="3" fill="#0F172A" />
                <circle cx="58" cy="44" r="1" fill="#FFFFFF" />
                <path d="M 46 51 Q 50 56 54 51" stroke="#78350F" stroke-width="2" stroke-linecap="round" fill="none" />
                <circle cx="37" cy="49" r="2.5" fill="#F472B6" opacity="0.8" />
                <circle cx="63" cy="49" r="2.5" fill="#F472B6" opacity="0.8" />
            `;
        case 9: // 🐧 황제 펭귄
            return `
                <defs>
                    <radialGradient id="pen-body-${type}" cx="35%" cy="35%" r="65%">
                        <stop offset="0%" stop-color="#334155" />
                        <stop offset="70%" stop-color="#1E293B" />
                        <stop offset="100%" stop-color="#0F172A" />
                    </radialGradient>
                </defs>
                <circle cx="50" cy="50" r="44" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="2.5" />
                <ellipse cx="42" cy="80" rx="6" ry="3" fill="#F59E0B" />
                <ellipse cx="58" cy="80" rx="6" ry="3" fill="#F59E0B" />
                <ellipse cx="26" cy="56" rx="6" ry="14" fill="url(#pen-body-${type})" transform="rotate(20 26 56)" />
                <ellipse cx="74" cy="56" rx="6" ry="14" fill="url(#pen-body-${type})" transform="rotate(-20 74 56)" />
                <ellipse cx="50" cy="50" rx="22" ry="28" fill="url(#pen-body-${type})" />
                <ellipse cx="50" cy="54" rx="15" ry="21" fill="#FFFFFF" />
                <circle cx="43" cy="36" r="2.5" fill="#0F172A" />
                <circle cx="44" cy="35" r="0.8" fill="#FFFFFF" />
                <circle cx="57" cy="36" r="2.5" fill="#0F172A" />
                <circle cx="58" cy="35" r="0.8" fill="#FFFFFF" />
                <path d="M 50 38 L 45 44 L 55 44 Z" fill="#F59E0B" />
            `;
        default:
            return "";
    }
}

function getCosmicStickerSvg(index, isSticker, rawMemo = "") {
    const parsed = parseStickerMemo(rawMemo);
    const type = (parsed.type !== null && parsed.type >= 0 && parsed.type < 10) ? parsed.type : (index % 10);
    
    if (!isSticker) {
        return `
            <svg viewBox="0 0 100 100" class="sea-sticker-svg placeholder" style="opacity: 0.35;">
                <g filter="grayscale(30%)">
                    ${getSeaCreatureGraphic(type)}
                </g>
            </svg>
        `;
    }
    return `
        <svg viewBox="0 0 100 100" class="sea-sticker-svg active">
            ${getSeaCreatureGraphic(type)}
        </svg>
    `;
}

function renderStickerPickerGrid() {
    const gridContainer = document.getElementById("sticker-select-grid");
    if (!gridContainer) return;
    gridContainer.innerHTML = "";
    
    SEA_CREATURES.forEach(creature => {
        const isSel = creature.id === selectedStickerType;
        const item = document.createElement("div");
        item.className = `sticker-option-item ${isSel ? "selected" : ""}`;
        item.innerHTML = `
            <div class="sticker-option-icon">
                <svg viewBox="0 0 100 100" style="width:100%; height:100%;">
                    ${getSeaCreatureGraphic(creature.id)}
                </svg>
            </div>
            <span class="sticker-option-label">${creature.name}</span>
        `;
        
        item.addEventListener("click", () => {
            selectedStickerType = creature.id;
            document.querySelectorAll(".sticker-option-item").forEach(el => el.classList.remove("selected"));
            item.classList.add("selected");
        });
        
        gridContainer.appendChild(item);
    });
}

// ==========================================
// 5.5 등록된 보드 목록 관리 및 사이드바 렌더링
// ==========================================

// 모든 스티커판 목록 조회 (서버 전체 탐색용 - 달 칭찬스티커 보드만 반환)
async function apiGetAllBoards() {
    if (isLocalMode || !supabaseClient) {
        // 로컬스토리지 전체 키 순회
        const boards = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith("board_")) {
                try {
                    const board = JSON.parse(localStorage.getItem(key));
                    if (board && isMoonBoard(board)) {
                        boards.push(board);
                    }
                } catch(e){}
            }
        }
        boards.sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));
        return boards;
    } else {
        try {
            const { data, error } = await supabaseClient
                .from("praise_boards")
                .select("*")
                .order("created_at", { ascending: true });
            if (error) throw error;
            return (data || []).filter(b => isMoonBoard(b));
        } catch (e) {
            console.error("전체 보드 조회 실패", e);
            const boards = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith("board_")) {
                    try {
                        const board = JSON.parse(localStorage.getItem(key));
                        if (board && isMoonBoard(board)) {
                            boards.push(board);
                        }
                    } catch(e){}
                }
            }
            boards.sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));
            return boards;
        }
    }
}

// 다음 순차적 보드 코드 생성 (기존 보드 중 마지막 숫자 + 1, 예: BON_WOOK1 -> BON_WOOK2)
async function getNextSequentialBoardCode() {
    const allBoards = await apiGetAllBoards();
    let maxNum = 0;
    let prefix = "";
    
    allBoards.forEach(b => {
        if (b && b.id && !b.id.startsWith("TEST-BOARD-")) {
            const match = String(b.id).match(/^(.*?)(\d+)$/);
            if (match) {
                const currentPrefix = match[1];
                const num = parseInt(match[2], 10);
                if (!isNaN(num) && num > maxNum) {
                    maxNum = num;
                    if (currentPrefix) prefix = currentPrefix;
                }
            }
        }
    });
    
    const nextNum = maxNum + 1;
    return prefix ? `${prefix}${nextNum}` : String(nextNum);
}

// 보드 이름 수정 API
async function apiUpdateBoardTitle(boardId, newTitle) {
    let board = await apiGetBoard(boardId);
    if (!board) return false;
    
    board.title = newTitle;
    const result = await apiCreateBoard(board);
    if (result.success) {
        addRegisteredBoard(boardId, newTitle, board.reward_text);
        return true;
    }
    console.error("보드 이름 수정 실패:", result.error);
    return false;
}

// 보드 아이템 정보 수정 모달 오픈 핸들러
async function openBoardEditModal(board) {
    let fullBoard = (await apiGetBoard(board.id)) || board;
    editTargetBoard = fullBoard;
    const hasPermission = localStorage.getItem("is_editor") === "true";

    if (hasPermission) {
        if (editBoardTitle) editBoardTitle.disabled = false;
        if (editBoardTargetCount) editBoardTargetCount.disabled = false;
        if (editBoardReward) editBoardReward.disabled = false;
        if (btnBoardEditSave) btnBoardEditSave.classList.remove("hidden");
    } else {
        if (editBoardTitle) editBoardTitle.disabled = true;
        if (editBoardTargetCount) editBoardTargetCount.disabled = true;
        if (editBoardReward) editBoardReward.disabled = true;
        if (btnBoardEditSave) btnBoardEditSave.classList.add("hidden");
    }

    if (editBoardTitle) editBoardTitle.value = fullBoard.title || "";
    if (editBoardTargetCount) editBoardTargetCount.value = fullBoard.target_count || 30;
    if (editBoardReward) editBoardReward.value = fullBoard.reward_text || "";

    if (modalBoardEdit) {
        modalBoardEdit.classList.remove("hidden");
    }
}

// 등록된 보드 목록 관리 헬퍼 함수들
function getRegisteredBoards() {
    const list = localStorage.getItem("registered_boards");
    const parsed = list ? JSON.parse(list) : [];
    return parsed.filter(b => isMoonBoard(b));
}

function addRegisteredBoard(boardId, title, rewardText) {
    let list = getRegisteredBoards();
    const existingIndex = list.findIndex(b => b.id === boardId);
    if (existingIndex !== -1) {
        list[existingIndex].title = title;
        if (rewardText !== undefined) {
            list[existingIndex].reward_text = rewardText;
        }
    } else {
        list.push({ id: boardId, title: title, reward_text: rewardText || "" });
    }
    localStorage.setItem("registered_boards", JSON.stringify(list));
}

function getBoardOrder() {
    const saved = localStorage.getItem("board_order");
    return saved ? JSON.parse(saved) : [];
}

function saveBoardOrder(orderedIds) {
    localStorage.setItem("board_order", JSON.stringify(orderedIds));
    
    let list = getRegisteredBoards();
    list.sort((a, b) => {
        const idxA = orderedIds.indexOf(a.id);
        const idxB = orderedIds.indexOf(b.id);
        if (idxA === -1) return 1;
        if (idxB === -1) return -1;
        return idxA - idxB;
    });
    localStorage.setItem("registered_boards", JSON.stringify(list));
}

function removeRegisteredBoard(boardId) {
    let list = getRegisteredBoards();
    list = list.filter(b => b.id !== boardId);
    localStorage.setItem("registered_boards", JSON.stringify(list));
    
    const orderList = getBoardOrder().filter(id => id !== boardId);
    localStorage.setItem("board_order", JSON.stringify(orderList));
    
    if (currentBoardId === boardId) {
        if (list.length > 0) {
            currentBoardId = list[0].id;
        } else {
            currentBoardId = "DEFAULT";
        }
        localStorage.setItem("current_board_id", currentBoardId);
    }
}

let lastBoardListFingerprint = "";

// 사이드바 내부 보드 목록 동적 렌더링 (지능적 핑거프린트 대조로 깜빡임 완전 방지)
async function renderBoardList(force = false) {
    if (!boardListContainer) return;
    
    let serverBoards = await apiGetAllBoards();
    let localList = getRegisteredBoards();
    
    const boardMap = new Map();
    serverBoards.forEach(b => {
        if (b && b.id) {
            boardMap.set(b.id, { ...b });
        }
    });
    localList.forEach(b => {
        if (b && b.id) {
            const existing = boardMap.get(b.id) || {};
            boardMap.set(b.id, { ...existing, ...b });
        }
    });
    
    const combinedList = Array.from(boardMap.values());

    const orderList = getBoardOrder();
    if (orderList.length > 0) {
        combinedList.sort((a, b) => {
            const idxA = orderList.indexOf(a.id);
            const idxB = orderList.indexOf(b.id);
            if (idxA !== -1 && idxB !== -1) return idxA - idxB;
            if (idxA !== -1) return -1;
            if (idxB !== -1) return 1;
            return 0;
        });
    }

    const fingerprint = combinedList.map(b => `${b.id}:${b.title}:${b.reward_text}:${b.id === currentBoardId}`).join('|');
    
    if (!force && fingerprint === lastBoardListFingerprint) {
        return;
    }
    lastBoardListFingerprint = fingerprint;

    boardListContainer.innerHTML = "";
    
    if (combinedList.length === 0) {
        const emptyMsg = document.createElement("div");
        emptyMsg.style.fontSize = "11px";
        emptyMsg.style.color = "var(--text-muted)";
        emptyMsg.style.textAlign = "center";
        emptyMsg.style.padding = "10px 0";
        emptyMsg.textContent = "등록된 스티커판이 없습니다. 🧸";
        boardListContainer.appendChild(emptyMsg);
    } else {
        combinedList.forEach(board => {
            const item = createBoardItemDOM(board, true);
            boardListContainer.appendChild(item);
        });
    }
}

// 보드 아이템 DOM 요소 생성 헬퍼
function createBoardItemDOM(board, isLocal) {
    const isActive = board.id === currentBoardId;
    const item = document.createElement("div");
    item.className = `board-item ${isActive ? "active" : ""}`;
    item.dataset.boardId = board.id;
    
    const hasPermission = localStorage.getItem("is_editor") === "true";

    const editButtonHtml = `
        <button class="btn-edit-board" title="스티커판 정보 수정">
            <span class="material-icons" style="font-size: 16px;">edit</span>
        </button>
    `;

    const deleteButtonHtml = (isLocal && hasPermission) ? `
        <button class="btn-delete-board" title="삭제">
            <span class="material-icons" style="font-size: 16px;">delete</span>
        </button>
    ` : '';

    item.innerHTML = `
        <div class="board-item-info">
            <span class="board-item-title">${board.title}</span>
            <span class="board-item-code">보상: ${board.reward_text || '없음'}</span>
        </div>
        <div class="board-item-actions">
            ${editButtonHtml}
            ${deleteButtonHtml}
        </div>
    `;

    let isReorderDrag = false;
    item.addEventListener("click", async () => {
        if (isReorderDrag) {
            isReorderDrag = false;
            return;
        }
        if (isActive) return;
        
        loadingSpinner.classList.remove("hidden");
        sidebar.classList.remove("open");
        sidebarOverlay.classList.add("hidden");
        
        currentBoardId = board.id;
        localStorage.setItem("current_board_id", currentBoardId);
        isEditorMode = localStorage.getItem("is_editor") === "true";
        updateRoleUI();
        await refreshApp();
        
        const newUrl = `${window.location.origin}${window.location.pathname}?board=${board.id}`;
        window.history.replaceState({ path: newUrl }, "", newUrl);
    });

    let pressTimer = null;
    let startY = 0;
    let dragStartY = 0;
    let initialLayoutTop = 0;
    let isDragging = false;

    const startDragHandler = (e) => {
        if (e.type === 'mousedown' && e.button !== 0) return;
        const targetBtn = e.target.closest("button");
        if (targetBtn) return;

        isReorderDrag = false;
        startY = e.type.startsWith('touch') ? (e.touches[0] ? e.touches[0].clientY : 0) : e.clientY;

        pressTimer = setTimeout(() => {
            const canEdit = localStorage.getItem("is_editor") === "true";
            if (!canEdit) {
                showToast("편집자 권한(여자친구 모드)에서만 스티커판 순서를 변경할 수 있습니다. 🔒");
                return;
            }

            isDragging = true;
            isReorderDrag = true;
            dragStartY = startY;
            initialLayoutTop = item.offsetTop;

            item.classList.add("dragging");
            if (boardListContainer) boardListContainer.classList.add("is-reordering");
            if (navigator.vibrate) navigator.vibrate(40);

            item.style.transform = `translate3d(0, 0px, 0) scale(1.03)`;

            window.addEventListener("mousemove", onMoveHandler, { passive: false });
            window.addEventListener("touchmove", onMoveHandler, { passive: false });
            window.addEventListener("mouseup", onEndHandler);
            window.addEventListener("touchend", onEndHandler);
            window.addEventListener("touchcancel", onEndHandler);
        }, 350);
    };

    const cancelTimerHandler = (e) => {
        if (!isDragging && pressTimer) {
            const currentY = e.type.startsWith('touch') ? (e.touches[0] ? e.touches[0].clientY : 0) : e.clientY;
            if (Math.abs(currentY - startY) > 8) {
                clearTimeout(pressTimer);
                pressTimer = null;
            }
        }
    };

    const onMoveHandler = (e) => {
        if (!isDragging) return;
        if (e.cancelable) e.preventDefault();

        const currentY = e.type.startsWith('touch') ? (e.touches[0] ? e.touches[0].clientY : 0) : e.clientY;
        
        const currentLayoutTop = item.offsetTop;
        const deltaY = (currentY - dragStartY) - (currentLayoutTop - initialLayoutTop);
        item.style.transform = `translate3d(0, ${deltaY}px, 0) scale(1.03)`;

        const siblings = [...boardListContainer.querySelectorAll(".board-item:not(.dragging)")];
        let nextSibling = siblings.find(sibling => {
            const box = sibling.getBoundingClientRect();
            return currentY < box.top + box.height / 2;
        });

        if (nextSibling) {
            if (nextSibling !== item.nextSibling) {
                boardListContainer.insertBefore(item, nextSibling);
            }
        } else {
            if (item.nextSibling !== null) {
                boardListContainer.appendChild(item);
            }
        }
    };

    const onEndHandler = () => {
        if (pressTimer) {
            clearTimeout(pressTimer);
            pressTimer = null;
        }

        if (isDragging) {
            isDragging = false;
            item.classList.remove("dragging");
            item.style.transform = "";
            if (boardListContainer) boardListContainer.classList.remove("is-reordering");

            window.removeEventListener("mousemove", onMoveHandler);
            window.removeEventListener("touchmove", onMoveHandler);
            window.removeEventListener("mouseup", onEndHandler);
            window.removeEventListener("touchend", onEndHandler);
            window.removeEventListener("touchcancel", onEndHandler);

            const newOrderList = Array.from(boardListContainer.querySelectorAll(".board-item"))
                .map(el => el.dataset.boardId)
                .filter(Boolean);

            saveBoardOrder(newOrderList);
        }
    };

    item.addEventListener("mousedown", startDragHandler);
    item.addEventListener("mousemove", cancelTimerHandler);
    item.addEventListener("mouseleave", () => { if (!isDragging && pressTimer) { clearTimeout(pressTimer); pressTimer = null; } });

    item.addEventListener("touchstart", startDragHandler, { passive: true });
    item.addEventListener("touchmove", cancelTimerHandler, { passive: true });
    item.addEventListener("touchcancel", () => { if (!isDragging && pressTimer) { clearTimeout(pressTimer); pressTimer = null; } });

    const btnEdit = item.querySelector(".btn-edit-board");
    if (btnEdit) {
        btnEdit.addEventListener("mousedown", (e) => e.stopPropagation());
        btnEdit.addEventListener("mouseup", (e) => e.stopPropagation());
        btnEdit.addEventListener("touchstart", (e) => e.stopPropagation(), { passive: true });
        btnEdit.addEventListener("touchend", (e) => e.stopPropagation(), { passive: true });

        btnEdit.addEventListener("click", (e) => {
            e.stopPropagation();
    item.addEventListener("touchmove", cancelPress, { passive: true });

    // 3. 삭제 버튼 클릭 (완전 삭제 - 편집 권한 보유 시에만 작동)
    if (isLocal && hasPermission) {
        const btnDelete = item.querySelector(".btn-delete-board");
        if (btnDelete) {
            btnDelete.addEventListener("click", async (e) => {
                e.stopPropagation();
                if (confirm(`'${board.title}' 판을 삭제하시겠습니까?\n(실제 데이터와 등록된 스티커 목록이 모두 영구적으로 삭제됩니다.)`)) {
                    loadingSpinner.classList.remove("hidden");
                    const wasActive = board.id === currentBoardId;
                    
                    // 실제 데이터 삭제 API 호출
                    await apiDeleteBoard(board.id);
                    
                    // 로컬 기기 리스트에서 제외
                    removeRegisteredBoard(board.id);
                    
                    if (wasActive) {
                        sidebar.classList.remove("open");
                        sidebarOverlay.classList.add("hidden");
                        const newUrl = `${window.location.origin}${window.location.pathname}?board=${currentBoardId}`;
                        window.history.replaceState({ path: newUrl }, "", newUrl);
                        await refreshApp();
                    } else {
                        renderBoardList();
                        loadingSpinner.classList.add("hidden");
                    }
                    showToast("스티커판이 완전히 삭제되었습니다.");
                }
            });
        }
    }

    return item;
}

// ==========================================
// 6. UI 업데이트 및 렌더링 로직
// ==========================================

// 현재 화면 리프레시
async function refreshApp() {
    try {
        // 1. 보드 정보 로드
        let board = await apiGetBoard(currentBoardId);
        if (!board) {
            // 보드가 존재하지 않음 -> 초기 설정 화면 노출
            appContent.classList.add("hidden");
            welcomeScreen.classList.remove("hidden");
            
            // 설정 폼에 현재 보드 ID 자동 완성 및 테스트값 미리 채우기
            if (currentBoardId === "DEFAULT" || currentBoardId.startsWith("TEST-")) {
                setupBoardId.value = currentBoardId === "DEFAULT" ? "TEST-COSMIC-BOARD" : currentBoardId;
                setupTitle.value = "우주 칭찬나라 테스트판 💖";
                setupTargetCount.value = "30";
                setupReward.value = "맛있는 디저트 데이트! 🍦";
                setupPin.value = "1234";
            } else {
                setupBoardId.value = currentBoardId;
            }
            return;
        }

        // 보드가 정상적으로 로드된 경우 설정창 숨기고 콘텐츠 노출
        welcomeScreen.classList.add("hidden");
        currentBoard = board;

        // 로컬 보드 목록 관리 및 갱신
        addRegisteredBoard(board.id, board.title, board.reward_text);
        renderBoardList();

        // 2. 스티커 정보 로드
        currentStickers = await apiGetStickers(currentBoardId);
        const activeIndices = new Set(currentStickers.map(s => s.sticker_index));

        // 3. 헤더 및 요약 카드 업데이트
        boardTitle.textContent = currentBoard.title;
        boardCodeDisplay.textContent = `보상: ${currentBoard.reward_text || '없음'}`;

        const targetCount = currentBoard.target_count;
        const completedCount = currentStickers.length;
        progressCount.textContent = `${completedCount} / ${targetCount} 개`;

        const percentage = Math.min((completedCount / targetCount) * 100, 100);
        progressBarFill.style.width = `${percentage}%`;

        // 축하 배너 처리
        if (completedCount >= targetCount) {
            celebrationRewardDetail.textContent = `${currentBoard.reward_text}을(를) 획득할 시간이에요! 🎁`;
            celebrationBanner.classList.remove("hidden");
        } else {
            celebrationBanner.classList.add("hidden");
        }

        // 4. 스티커 판 격자 그리기 (개수가 보존되어 있으면 DOM을 파괴하지 않고 상태만 개별 갱신하여 깜빡임 완전 방지)
        const existingSlots = Array.from(stickerGrid.children);
        if (existingSlots.length !== targetCount) {
            stickerGrid.innerHTML = "";
            for (let i = 0; i < targetCount; i++) {
                const slot = createSlotElement(i);
                stickerGrid.appendChild(slot);
            }
        }

        const currentSlotElements = stickerGrid.children;
        for (let i = 0; i < targetCount; i++) {
            const slot = currentSlotElements[i];
            if (!slot) continue;

            const isActive = activeIndices.has(i);
            const stickerData = currentStickers.find(s => s.sticker_index === i);
            const rawMemo = stickerData && stickerData.memo ? stickerData.memo : "";

            const prevActive = slot.classList.contains("active");
            const prevMemo = slot.getAttribute("data-memo") || "";

            if (prevActive !== isActive || prevMemo !== rawMemo || !slot.hasChildNodes()) {
                slot.className = `grid-slot ${isActive ? "active" : ""}`;
                slot.setAttribute("data-memo", rawMemo);
                slot.innerHTML = `
                    ${getCosmicStickerSvg(i, isActive)}
                    <span class="slot-number">${i + 1}</span>
                `;
            }
        }

        // 5. 모달 내의 필드 업데이트 (현재 설정 대입)
        if (editReaderName) editReaderName.value = localStorage.getItem("global_reader_role_name") || currentBoard.reader_role_name || "남자친구 모드 (조회 전용)";
        if (editEditorName) editEditorName.value = localStorage.getItem("global_editor_role_name") || currentBoard.editor_role_name || "여자친구 모드 (부착 가능)";

        // 컨텐츠 표출
        appContent.classList.remove("hidden");
    } catch (err) {
        console.error("refreshApp 실행 중 오류 발생:", err);
    } finally {
        // 로딩 종료 보장
        loadingSpinner.classList.add("hidden");
    }
}

// 단일 슬롯 DOM 요소 생성 헬퍼
function createSlotElement(i) {
    const slot = document.createElement("div");
    slot.className = "grid-slot";

    let pressTimer = null;
    let preventClick = false;

    const startPress = (e) => {
        if (e.type === 'mousedown' && e.button !== 0) return;
        preventClick = false;
        pressTimer = setTimeout(() => {
            preventClick = true;
            const stickerData = currentStickers.find(s => s.sticker_index === i);
            handleSlotLongPress(i, !!stickerData);
        }, 600);
    };

    const cancelPress = () => {
        if (pressTimer) {
            clearTimeout(pressTimer);
            pressTimer = null;
        }
    };

    const endPress = () => {
        if (pressTimer) {
            clearTimeout(pressTimer);
            pressTimer = null;
        }
    };

    slot.addEventListener("mousedown", startPress);
    slot.addEventListener("mouseup", endPress);
    slot.addEventListener("mouseleave", cancelPress);

    slot.addEventListener("touchstart", startPress, { passive: true });
    slot.addEventListener("touchend", endPress, { passive: true });
    slot.addEventListener("touchcancel", cancelPress, { passive: true });
    slot.addEventListener("touchmove", cancelPress, { passive: true });

    slot.addEventListener("click", (e) => {
        if (preventClick) {
            e.preventDefault();
            preventClick = false;
            return;
        }
        const stickerData = currentStickers.find(s => s.sticker_index === i);
        handleSlotClick(i, !!stickerData);
    });

    return slot;
}

// 날짜 포맷 함수
function formatDate(dateStr) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const date = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    
    return `${year}년 ${month}월 ${date}일 ${hours}:${minutes}`;
}

// 스티커 슬롯 클릭 제어 (짧은 클릭: 메모 작성 또는 조회)
async function handleSlotClick(index, isActive) {
    if (isActive) {
        // 이미 붙은 스티커 클릭 시: 메모 모달창 노출
        editTargetIndex = index;
        const sticker = currentStickers.find(s => s.sticker_index === index);
        const rawMemo = sticker && sticker.memo ? sticker.memo : "";
        const parsed = parseStickerMemo(rawMemo);
        
        const displayMemoText = parsed.memo ? parsed.memo : "등록된 칭찬 메모가 없습니다. 🧸";
        const createdDate = sticker && sticker.created_at ? formatDate(sticker.created_at) : "";
        const updatedDate = sticker && sticker.updated_at ? formatDate(sticker.updated_at) : "";

        // 최초 생성 시간과 최근 수정 시간의 차이가 5초 이상인 경우에만 실제 수정된 것으로 간주
        const createdTime = sticker && sticker.created_at ? new Date(sticker.created_at).getTime() : 0;
        const updatedTime = sticker && sticker.updated_at ? new Date(sticker.updated_at).getTime() : 0;
        const isModified = createdTime && updatedTime && Math.abs(updatedTime - createdTime) > 5000;

        viewStickerMemoText.textContent = displayMemoText;
        viewStickerCreatedAt.textContent = createdDate ? `최초 작성: ${createdDate}` : "";
        
        if (updatedDate && isModified) {
            viewStickerUpdatedAt.textContent = `최근 수정: ${updatedDate}`;
            viewStickerUpdatedAt.classList.remove("hidden");
        } else {
            viewStickerUpdatedAt.textContent = "";
            viewStickerUpdatedAt.classList.add("hidden");
        }

        // 수정/저장 관련 UI 초기화
        document.querySelector("#modal-memo-view .memo-view-content").classList.remove("hidden");
        memoEditArea.classList.add("hidden");
        btnMemoEditCancel.classList.add("hidden");
        btnMemoEditSave.classList.add("hidden");
        btnMemoViewClose.classList.remove("hidden");

        if (isEditorMode) {
            btnMemoEditStart.classList.remove("hidden");
        } else {
            btnMemoEditStart.classList.add("hidden");
        }

        modalMemoView.classList.remove("hidden");
    } else {
        // 빈칸 클릭 시: 편집자만 스티커 선택 & 메모 작성 모달 노출
        if (!isEditorMode) {
            showToast("스티커 추가는 여자친구(편집자)만 가능해요! 🧸");
            return;
        }
        memoTargetIndex = index;
        selectedStickerType = index % 10; // 기본 선택 스티커
        inputStickerMemo.value = "";
        
        renderStickerPickerGrid();
        
        modalMemoInput.classList.remove("hidden");
        inputStickerMemo.focus();
    }
}

// 스티커 슬롯 롱프레스 제어 (길게 누르기: 스티커 떼기)
async function handleSlotLongPress(index, isActive) {
    if (!isActive) return; // 빈칸은 롱프레스 무시

    if (!isEditorMode) {
        showToast("스티커 제거는 여자친구(편집자)만 가능해요! 🧸");
        return;
    }

    deleteTargetIndex = index;
    deleteConfirmText.textContent = `스티커를 떼겠습니까?`;
    modalDelete.classList.remove("hidden");
}

// ==========================================
// 7. 역할 모드 토글 (인증 및 로그아웃)
// ==========================================
function updateRoleUI() {
    const globalReaderName = localStorage.getItem("global_reader_role_name");
    const globalEditorName = localStorage.getItem("global_editor_role_name");

    if (isEditorMode) {
        if (btnToggleRole) btnToggleRole.className = "sidebar-role-btn editor-mode";
        if (roleIcon) roleIcon.textContent = "edit";
        if (roleText) roleText.textContent = globalEditorName || (currentBoard && currentBoard.editor_role_name) || "여자친구 모드 (부착 가능)";

        // 설정 모달 내 필드 활성화
        document.querySelectorAll(".editor-only-field").forEach(el => el.disabled = false);
        btnSettingsSave.classList.remove("hidden");
    } else {
        if (btnToggleRole) btnToggleRole.className = "sidebar-role-btn reader-mode";
        if (roleIcon) roleIcon.textContent = "visibility";
        if (roleText) roleText.textContent = globalReaderName || (currentBoard && currentBoard.reader_role_name) || "남자친구 모드 (조회 전용)";

        // 설정 모달 내 필드 비활성화
        document.querySelectorAll(".editor-only-field").forEach(el => el.disabled = true);
        btnSettingsSave.classList.add("hidden");
    }
}

// ==========================================
// 8. 다이얼로그 모달 상호작용 및 이벤트 리스너
// ==========================================

// 토스트 메시지 띄우기
let toastTimeout = null;
function showToast(message) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.remove("hidden");
    toast.style.opacity = 1;

    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toast.style.opacity = 0;
        setTimeout(() => toast.classList.add("hidden"), 300);
    }, 2500);
}

// PIN 번호 확인 처리
btnPinSubmit.addEventListener("click", () => {
    const pin = inputPin.value;
    const requiredPin = localStorage.getItem("global_editor_pin") || currentBoard.editor_pin || "";

    if (pin === requiredPin) {
        isEditorMode = true;
        localStorage.setItem("is_editor", "true"); // 로컬스토리지에 인증 승인 기록
        inputPin.value = "";
        pinError.classList.add("hidden");
        modalPin.classList.add("hidden");
        updateRoleUI();
        refreshApp();
        showToast("여자친구 편집 권한이 승인되었습니다! 🌸");
    } else {
        pinError.classList.remove("hidden");
    }
});

btnPinCancel.addEventListener("click", () => {
    inputPin.value = "";
    pinError.classList.add("hidden");
    modalPin.classList.add("hidden");
});

// 역할 전환 버튼
btnToggleRole.addEventListener("click", () => {
    if (isEditorMode) {
        isEditorMode = false;
        localStorage.removeItem("is_editor"); // 로그아웃 시 인증 승인 기록 삭제
        updateRoleUI();
        refreshApp();
        showToast("조회 전용 모드로 복귀했습니다.");
    } else {
        modalPin.classList.remove("hidden");
        inputPin.focus();
    }
});

// 새 칭찬판 만들기 다이얼로그 노출
btnShare.addEventListener("click", () => {
    modalShare.classList.remove("hidden");
    inputCreateBoardTitle.value = "";
    inputCreateBoardTitle.focus();
});

btnShareClose.addEventListener("click", () => {
    modalShare.classList.add("hidden");
});

// 새로운 칭찬판 생성 (백그라운드에서 난수 코드 자동 생성 및 대조)
btnCreateBoard.addEventListener("click", async () => {
    const titleVal = inputCreateBoardTitle.value.trim();
    const finalTitle = titleVal || "우리의 새로운 칭찬판 💖";

    loadingSpinner.classList.remove("hidden");
    modalShare.classList.add("hidden");

    // 순차적 보드 코드 생성 (마지막 숫자 + 1, 예: 달의 마지막 숫자가 2면 다음은 3)
    const finalCode = await getNextSequentialBoardCode();

    const newBoard = {
        id: finalCode,
        title: finalTitle,
        target_count: 30,
        reward_text: "새로운 선물 지정하기",
        editor_pin: currentBoard ? currentBoard.editor_pin : "1234",
        created_at: new Date().toISOString()
    };

    const result = await apiCreateBoard(newBoard);
    if (result.success) {
        currentBoardId = finalCode;
        localStorage.setItem("current_board_id", finalCode);
        localStorage.setItem("is_editor", "true");
        inputCreateBoardTitle.value = "";
        isEditorMode = true;
        updateRoleUI();
        await refreshApp();
        
        showToast("새 칭찬판이 생성되었습니다! 🚀");
    } else {
        showToast(`칭찬판 개설 실패: ${result.error}`);
        loadingSpinner.classList.add("hidden");
        modalShare.classList.remove("hidden");
    }
});

// 설정 다이얼로그 노출/숨김
btnSettings.addEventListener("click", () => {
    modalSettings.classList.remove("hidden");
});

btnSettingsClose.addEventListener("click", () => {
    modalSettings.classList.add("hidden");
});

// 칭찬판 코드 스위칭
btnSwitchBoard.addEventListener("click", async () => {
    const code = inputSwitchBoard.value.trim().toUpperCase();
    if (!code) {
        showToast("코드를 입력해 주세요.");
        return;
    }

    loadingSpinner.classList.remove("hidden");
    modalSettings.classList.add("hidden");

    const board = await apiGetBoard(code);
    if (board) {
        currentBoardId = code;
        localStorage.setItem("current_board_id", code);
        inputSwitchBoard.value = "";
        isEditorMode = false; // 새로운 보드로 이동할 때는 기본 뷰어 모드로 안전화
        updateRoleUI();
        await refreshApp();
        showToast(`칭찬판 '${board.title}'을 성공적으로 불러왔습니다!`);
    } else {
        showToast("존재하지 않는 칭찬판 공유 코드입니다.");
        loadingSpinner.classList.add("hidden");
        modalSettings.classList.remove("hidden");
    }
});

// 칭찬판 세부 설정 변경 및 저장 (보안 및 라벨 전용)
btnSettingsSave.addEventListener("click", async () => {
    if (!isEditorMode) return;

    loadingSpinner.classList.remove("hidden");
    modalSettings.classList.add("hidden");

    const newPin = editPin.value.trim();
    const newReaderName = editReaderName.value.trim();
    const newEditorName = editEditorName.value.trim();

    localStorage.setItem("global_editor_pin", newPin);
    localStorage.setItem("global_reader_role_name", newReaderName);
    localStorage.setItem("global_editor_role_name", newEditorName);

    const updated = {
        ...currentBoard,
        editor_pin: newPin || currentBoard.editor_pin,
        reader_role_name: newReaderName || "남자친구 모드 (조회 전용)",
        editor_role_name: newEditorName || "여자친구 모드 (부착 가능)"
    };

    const result = await apiCreateBoard(updated);
    // 로컬 캐시에는 apiCreateBoard 내부에서 이미 저장됨 → 로컬 상태는 항상 갱신
    currentBoard = updated;
    await refreshApp();

    if (result.success) {
        showToast("칭찬판 보안 및 라벨 설정이 변경되었습니다. ✨");
    } else {
        showToast(`⚠️ 서버 저장 실패: ${result.error}`);
    }
});

// 칭찬판 정보 수정 저장 처리 (길게 누르기 모달)
btnBoardEditSave.addEventListener("click", async () => {
    if (!editTargetBoard) return;
    const hasPermission = localStorage.getItem("is_editor") === "true";
    if (!hasPermission) return;

    const count = parseInt(editBoardTargetCount.value);
    if (isNaN(count) || count < 1 || count > 100) {
        showToast("올바른 목표 개수(1~100)를 입력하세요.");
        return;
    }

    loadingSpinner.classList.remove("hidden");
    if (modalBoardEdit) modalBoardEdit.classList.add("hidden");

    const updatedBoard = {
        ...editTargetBoard,
        title: editBoardTitle.value.trim() || editTargetBoard.title,
        target_count: count,
        reward_text: editBoardReward.value.trim()
    };

    const result = await apiCreateBoard(updatedBoard);
    // 로컬 캐시에는 apiCreateBoard 내부에서 이미 저장됨 → 로컬 상태는 항상 갱신
    addRegisteredBoard(editTargetBoard.id, updatedBoard.title, updatedBoard.reward_text);

    if (editTargetBoard.id === currentBoardId) {
        currentBoard = updatedBoard;
        await refreshApp();
    } else {
        renderBoardList();
        loadingSpinner.classList.add("hidden");
    }

    if (result.success) {
        showToast("칭찬판이 성공적으로 수정되었습니다! ✨");
    } else {
        showToast(`⚠️ 서버 저장 실패: ${result.error}`);
    }
    editTargetBoard = null;
});

btnBoardEditClose.addEventListener("click", () => {
    editTargetBoard = null;
    if (modalBoardEdit) modalBoardEdit.classList.add("hidden");
});

// 스티커 제거 확인 처리
btnDeleteConfirm.addEventListener("click", async () => {
    if (deleteTargetIndex === null) return;

    loadingSpinner.classList.remove("hidden");
    modalDelete.classList.add("hidden");

    const success = await apiRemoveSticker(currentBoardId, deleteTargetIndex);
    if (success) {
        showToast(`${deleteTargetIndex + 1}번째 스티커를 제거했습니다.`);
        deleteTargetIndex = null;
        await refreshApp();
    } else {
        showToast("스티커 제거 실패");
        loadingSpinner.classList.add("hidden");
    }
});

btnDeleteCancel.addEventListener("click", () => {
    deleteTargetIndex = null;
    modalDelete.classList.add("hidden");
});

// 칭찬 메모 입력 모달 이벤트 리스너
btnMemoSubmit.addEventListener("click", async () => {
    if (memoTargetIndex === null) return;
    const memoText = inputStickerMemo.value.trim();
    const formattedMemo = `[type:${selectedStickerType}] ${memoText}`;

    loadingSpinner.classList.remove("hidden");
    modalMemoInput.classList.add("hidden");

    const success = await apiAddSticker(currentBoardId, memoTargetIndex, formattedMemo);
    if (success) {
        const creatureName = SEA_CREATURES[selectedStickerType] ? SEA_CREATURES[selectedStickerType].name : "해양생물";
        showToast(`${memoTargetIndex + 1}번째 칸에 ${creatureName} 스티커 부착 완료! 🌊💙`);
        memoTargetIndex = null;
        await refreshApp();
    } else {
        showToast("스티커 부착 중 에러가 발생했습니다.");
        loadingSpinner.classList.add("hidden");
    }
});

btnMemoCancel.addEventListener("click", () => {
    memoTargetIndex = null;
    modalMemoInput.classList.add("hidden");
});

// 칭찬 메모 확인 모달 이벤트 리스너
btnMemoViewClose.addEventListener("click", () => {
    editTargetIndex = null;
    modalMemoView.classList.add("hidden");
});

// 메모 수정 시작
btnMemoEditStart.addEventListener("click", () => {
    if (editTargetIndex === null) return;
    const sticker = currentStickers.find(s => s.sticker_index === editTargetIndex);
    const parsed = parseStickerMemo(sticker && sticker.memo ? sticker.memo : "");
    inputEditStickerMemo.value = parsed.memo;
    
    // UI 전환
    document.querySelector("#modal-memo-view .memo-view-content").classList.add("hidden");
    memoEditArea.classList.remove("hidden");
    
    btnMemoEditStart.classList.add("hidden");
    btnMemoViewClose.classList.add("hidden");
    btnMemoEditCancel.classList.remove("hidden");
    btnMemoEditSave.classList.remove("hidden");
    
    inputEditStickerMemo.focus();
});

// 메모 수정 취소
btnMemoEditCancel.addEventListener("click", () => {
    document.querySelector("#modal-memo-view .memo-view-content").classList.remove("hidden");
    memoEditArea.classList.add("hidden");
    
    btnMemoEditStart.classList.remove("hidden");
    btnMemoViewClose.classList.remove("hidden");
    btnMemoEditCancel.classList.add("hidden");
    btnMemoEditSave.classList.add("hidden");
});

// 메모 수정 저장
btnMemoEditSave.addEventListener("click", async () => {
    if (editTargetIndex === null) return;
    const newMemoText = inputEditStickerMemo.value.trim();
    
    const sticker = currentStickers.find(s => s.sticker_index === editTargetIndex);
    const parsed = parseStickerMemo(sticker ? sticker.memo : "");
    const keepType = parsed.type !== null ? parsed.type : (editTargetIndex % 10);
    const formattedMemo = `[type:${keepType}] ${newMemoText}`;

    loadingSpinner.classList.remove("hidden");
    modalMemoView.classList.add("hidden");
    
    const success = await apiUpdateStickerMemo(currentBoardId, editTargetIndex, formattedMemo);
    if (success) {
        showToast("칭찬 메모가 수정되었습니다. ✨");
        editTargetIndex = null;
        await refreshApp();
    } else {
        showToast("메모 수정에 실패했습니다.");
        loadingSpinner.classList.add("hidden");
        modalMemoView.classList.remove("hidden");
    }
});

// ==========================================
// 9. 앱 초기 구동 및 실시간 데이터 싱크 폴링
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    // 1. 기존 데모/더미 데이터 로컬스토리지 캐시 정리
    localStorage.removeItem("board_DEFAULT");
    localStorage.removeItem("stickers_DEFAULT");

    // [소독 패치] 모바일 기기 로컬스토리지 내 자동 누적된 타인의 테스트 칭찬판 찌꺼기 정리
    try {
        const boards = JSON.parse(localStorage.getItem("registered_boards") || "[]");
        if (boards.length > 0) {
            const urlParams = new URLSearchParams(window.location.search);
            const activeParamId = (urlParams.get("board") || "").trim().toUpperCase();
            
            const cleaned = boards.filter(b => {
                const isCurrent = b.id === currentBoardId || b.id === activeParamId;
                const hasPermission = localStorage.getItem("is_editor") === "true";
                const isNotTestBoard = !b.id.startsWith("TEST-"); // 내 개설판(BON_WOOK 등) 보존
                
                return isCurrent || hasPermission || isNotTestBoard;
            });
            
            if (cleaned.length !== boards.length) {
                localStorage.setItem("registered_boards", JSON.stringify(cleaned));
            }
        }
    } catch (e) {
        console.error("로컬 스토리지 칭찬판 리스트 소독 중 오류:", e);
    }

    // 2. URL 쿼리 파라미터에서 보드 ID가 넘어온 경우 자동 설정
    const urlParams = new URLSearchParams(window.location.search);
    const boardParam = urlParams.get("board");
    if (boardParam) {
        currentBoardId = boardParam.trim().toUpperCase();
        localStorage.setItem("current_board_id", currentBoardId);
    }

    updateRoleUI();
    refreshApp();

    // 사이드바 토글 및 기능 바인딩
    if (btnMenu) {
        btnMenu.addEventListener("click", () => {
            sidebar.classList.add("open");
            sidebarOverlay.classList.remove("hidden");
            renderBoardList(true); // 열릴 때 최신 목록 렌더링
        });
    }

    if (btnSidebarClose) {
        btnSidebarClose.addEventListener("click", () => {
            sidebar.classList.remove("open");
            sidebarOverlay.classList.add("hidden");
        });
    }

    if (sidebarOverlay) {
        sidebarOverlay.addEventListener("click", () => {
            sidebar.classList.remove("open");
            sidebarOverlay.classList.add("hidden");
        });
    }
    
    if (btnAddBoardSidebar) {
        btnAddBoardSidebar.addEventListener("click", () => {
            sidebar.classList.remove("open");
            sidebarOverlay.classList.add("hidden");
            
            // 공유/생성 모달을 열고 새 보드 생성 인풋에 포커싱
            modalShare.classList.remove("hidden");
            inputCreateBoard.value = "";
            inputCreateBoardTitle.value = "";
            inputCreateBoardTitle.focus();
        });
    }

    // 2. 웰컴 스크린 칭찬판 최초 생성 처리
    btnSetupSubmit.addEventListener("click", async () => {
        const code = setupBoardId.value.trim().toUpperCase();
        const title = setupTitle.value.trim();
        const target = parseInt(setupTargetCount.value);
        const reward = setupReward.value.trim();
        const pin = setupPin.value.trim();

        if (!code) {
            showToast("공유 코드를 입력해 주세요.");
            return;
        }
        if (!title) {
            showToast("칭찬판 제목을 입력해 주세요.");
            return;
        }
        if (isNaN(target) || target < 1 || target > 100) {
            showToast("올바른 목표 개수(1~100)를 입력하세요.");
            return;
        }
        if (!pin) {
            showToast("비밀번호 PIN을 입력해 주세요.");
            return;
        }

        loadingSpinner.classList.remove("hidden");
        welcomeScreen.classList.add("hidden");

        const newBoard = {
            id: code,
            title: title,
            target_count: target,
            reward_text: reward,
            editor_pin: pin,
            created_at: new Date().toISOString()
        };

        const result = await apiCreateBoard(newBoard);
        if (result.success) {
            currentBoardId = code;
            localStorage.setItem("current_board_id", code);
            localStorage.setItem("is_editor", "true");
            isEditorMode = true;
            updateRoleUI();
            await refreshApp();
            showToast("칭찬판이 성공적으로 개설되었습니다! 🚀");
            
            const newUrl = `${window.location.origin}${window.location.pathname}?board=${code}`;
            window.history.replaceState({ path: newUrl }, "", newUrl);
        } else {
            showToast(`칭찬판 개설 실패: ${result.error}`);
            welcomeScreen.classList.remove("hidden");
            loadingSpinner.classList.add("hidden");
        }
    });

    // 탭 전환 시(앱으로 다시 돌아왔을 때) 1회 자동 동기화 (불필요한 5초 백그라운드 폴링 완전 제거)
    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") {
            refreshApp();
        }
    });
});
