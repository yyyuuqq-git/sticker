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

// 달 칭찬스티커 전용 보드 판별 (수산시장/물고기, 채소가게, 고양이 및 테스트 보드 100% 격리 - 프라이버시 엄격 보호)
function isMoonBoard(b) {
    if (!b) return false;
    const idStr = String(typeof b === 'string' ? b : (b.id || "")).toUpperCase();
    const titleStr = String(typeof b === 'object' && b.title ? b.title : "").toUpperCase();
    
    // 1. 테스트 보드 배제 (TEST_BOARD_x, TEST-BOARD-xxx 등, 레거시 TEST-COSMIC-BOARD는 허용)
    if (idStr.startsWith("TEST-BOARD") || idStr.startsWith("TEST_BOARD") || idStr === "TEST-BOARD" || idStr === "TEST_BOARD") return false;
    if (idStr.startsWith("TEST_") && !idStr.includes("COSMIC")) return false;
    if (titleStr.includes("테스트") && !idStr.includes("COSMIC") && !titleStr.includes("우주") && !titleStr.includes("달")) return false;

    // 2. 수산시장 / 물고기 / 싱싱 어류 보드 배제 (0427, 양건, FISH 등 100% 프라이버시 격리)
    if (idStr === "0427" || titleStr.includes("양건") || idStr.startsWith("FISH") || idStr.includes("FISH") || 
        titleStr.includes("수산시장") || titleStr.includes("물고기") || titleStr.includes("생선") || 
        titleStr.includes("어시장") || titleStr.includes("광어") || titleStr.includes("우럭") || 
        titleStr.includes("연어") || titleStr.includes("고등어") || titleStr.includes("참치") || 
        titleStr.includes("문어") || titleStr.includes("오징어") || titleStr.includes("새우") || 
        titleStr.includes("해산물") || titleStr.includes("바다") || titleStr.includes("츄르")) return false;

    // 3. 채소가게 보드 배제 (CHAEDO_, VEGE_ 등)
    if (idStr.startsWith("CHAEDO") || idStr.includes("VEGE") || idStr.includes("VEGETABLE") || 
        titleStr.includes("채소") || titleStr.includes("야채") || titleStr.includes("당근") || titleStr.includes("채건")) return false;

    // 4. 레거시 고양이 보드 배제 (CAT-BOARD, KITTY, MEOW, 고양이, 야옹 등)
    if (idStr === "CAT-BOARD" || idStr.startsWith("CAT") || idStr.includes("KITTY") || idStr.includes("MEOW") || 
        titleStr.includes("고양이") || titleStr.includes("야옹")) return false;

    return true;
}

let initialBoardId = localStorage.getItem("current_board_id");
if (!initialBoardId || !isMoonBoard(initialBoardId) || initialBoardId.startsWith("TEST-") || initialBoardId.startsWith("TEST_")) {
    const regList = (function() {
        try {
            const list = JSON.parse(localStorage.getItem("registered_boards") || "[]");
            return list.filter(b => isMoonBoard(b) && !String(typeof b === 'string' ? b : (b.id || '')).toUpperCase().startsWith("TEST-") && !String(typeof b === 'string' ? b : (b.id || '')).toUpperCase().startsWith("TEST_"));
        } catch(e) { return []; }
    })();
    initialBoardId = (regList.length > 0) ? regList[0].id : "BON_WOOK";
    localStorage.setItem("current_board_id", initialBoardId);
}
let currentBoardId = initialBoardId || "BON_WOOK";
let currentBoard = null;
let currentStickers = [];
let isEditorMode = localStorage.getItem("is_editor") === "true";
let deleteTargetIndex = null;
let deleteTargetBoardId = null;
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
const appMainLogo = document.getElementById("app-main-logo");
const editAppTitle = document.getElementById("edit-app-title");
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
const btnMemoRemove = document.getElementById("btn-memo-remove");

// 공용 버튼 트리거
const btnShare = document.getElementById("btn-share");
const btnSettings = document.getElementById("btn-settings");
const btnColorPalette = document.getElementById("btn-color-palette");

// RGB 색상 팔레트 모달 요소
const modalColorPalette = document.getElementById("modal-color-palette");
const btnColorClose = document.getElementById("btn-color-close");
const btnColorReset = document.getElementById("btn-color-reset");
const btnColorApply = document.getElementById("btn-color-apply");
const colorPreviewBox = document.getElementById("color-preview-box");
const colorPreviewText = document.getElementById("color-preview-text");
const rangeR = document.getElementById("range-r");
const rangeG = document.getElementById("range-g");
const rangeB = document.getElementById("range-b");
const valR = document.getElementById("val-r");
const valG = document.getElementById("val-g");
const valB = document.getElementById("val-b");
const inputCustomColor = document.getElementById("input-custom-color");

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
                // [명칭 소독 및 일괄 통일] 레거시 및 DB 타이틀 내 우주/칭찬나라/스티커핀 명칭을 스티커판으로 자동 치환
                if (mergedData.title && (mergedData.title.includes("우주") || mergedData.title.includes("칭찬나라") || mergedData.title.includes("스티커핀"))) {
                    mergedData.title = "스티커판";
                }
                if (mergedData.app_title && (mergedData.app_title.includes("우주") || mergedData.app_title.includes("칭찬나라") || mergedData.app_title.includes("스티커핀"))) {
                    mergedData.app_title = "스티커판";
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
    // 로컬 캐시에는 전체 board 객체를 항상 저장 (역할명, 테마색 등 로컬 전용 필드 포함)
    localStorage.setItem(`board_${board.id}`, JSON.stringify(board));
    if (board.theme_color) {
        localStorage.setItem(`board_theme_color_${board.id}`, board.theme_color);
    }

    if (isLocalMode || !supabaseClient) {
        return { success: true };
    } else {
        try {
            // Supabase praise_boards DB 스키마 표준 컬럼만 전송 (PGRST204 스키마 캐시 오류 방지)
            const dbBoard = {
                id: board.id,
                title: board.title,
                target_count: board.target_count,
                reward_text: board.reward_text,
                editor_pin: board.editor_pin || "1234"
            };
            if (board.created_at) {
                dbBoard.created_at = board.created_at;
            }

            const { error } = await supabaseClient
                .from("praise_boards")
                .upsert(dbBoard);

            if (error) {
                console.warn("Supabase praise_boards 싱크 알림 (로컬 캐시에 보존됨):", error.message || error);
            }
            return { success: true };
        } catch (e) {
            console.warn("보드 싱크 알림 (로컬 캐시에 보존됨):", e.message || String(e));
            return { success: true };
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

// 테마 색상 메타데이터 DB/로컬 저장 (인덱스 999 전용 레코드 활용 - 스키마 호환 100% 보장)
async function apiSaveThemeColor(boardId, hex) {
    if (!hex || !boardId) return;
    hex = hex.toUpperCase();
    const memoStr = `[theme:${hex}]`;
    const nowISO = new Date().toISOString();

    localStorage.setItem(`board_theme_color_${boardId}`, hex);

    if (isLocalMode || !supabaseClient) {
        let current = await apiGetStickers(boardId);
        let themeSticker = current.find(s => s.sticker_index === 999);
        if (themeSticker) {
            themeSticker.memo = memoStr;
            themeSticker.updated_at = nowISO;
        } else {
            current.push({
                board_id: boardId,
                sticker_index: 999,
                memo: memoStr,
                created_at: nowISO,
                updated_at: nowISO
            });
        }
        localStorage.setItem(`stickers_${boardId}`, JSON.stringify(current));
        return true;
    } else {
        try {
            // 1. Foreign Key Constraint(23503) 에러 방지: praise_boards 레코드가 DB에 선행 생성되도록 보장
            if (currentBoard) {
                await apiCreateBoard(currentBoard);
            }

            // 2. Unique Constraint(23505) 에러 방지: onConflict: "board_id,sticker_index" 안전 upsert
            const { error } = await supabaseClient
                .from("praise_stickers")
                .upsert({
                    board_id: boardId,
                    sticker_index: 999,
                    memo: memoStr,
                    created_at: nowISO,
                    updated_at: nowISO
                }, { onConflict: "board_id,sticker_index" });

            if (error) {
                console.error("테마 색상 DB 저장 실패:", error);
                return false;
            }
            console.log("테마 색상 DB 저장 성공:", hex);
            return true;
        } catch (e) {
            console.error("테마 색상 DB 저장 중 예외 발생:", e);
            return false;
        }
    }
}

// ==========================================
// 5. 감성 칭찬 스티커 5종 컬렉션 (달, 태양, 가오리, 파도, 고래)
// ==========================================
const PRAISE_STICKERS = [
    { id: 0, name: "초승달", emoji: "", src: "stickers/moon.png", desc: "초승달" },
    { id: 1, name: "태양", emoji: "", src: "stickers/sun.png", desc: "태양" },
    { id: 2, name: "가오리", emoji: "", src: "stickers/ray.png", desc: "가오리" },
    { id: 3, name: "파도", emoji: "", src: "stickers/wave.png", desc: "파도" },
    { id: 4, name: "고래", emoji: "", src: "stickers/whale.png", desc: "고래" }
];
const SEA_CREATURES = PRAISE_STICKERS; // 레거시 참조 및 하위 호환성 보장용 별칭

let selectedStickerType = 0;

function parseStickerMemo(rawMemo) {
    if (!rawMemo) return { type: null, memo: "" };
    const match = String(rawMemo).match(/^\[type:(\d+)\]\s*(.*)/s);
    if (match) {
        return { type: parseInt(match[1], 10), memo: match[2] };
    }
    return { type: null, memo: rawMemo };
}

function getStickerData(type) {
    const safeType = Math.abs(Number(type) || 0) % PRAISE_STICKERS.length;
    return PRAISE_STICKERS[safeType] || PRAISE_STICKERS[0];
}

function getSeaCreatureStickerSvg(index, isSticker, rawMemo = "") {
    if (!isSticker) {
        return "";
    }
    const parsed = parseStickerMemo(rawMemo);
    const type = (parsed.type !== null && parsed.type >= 0) ? (parsed.type % PRAISE_STICKERS.length) : (index % PRAISE_STICKERS.length);
    const item = getStickerData(type);

    return `
        <div class="sticker-img-container active">
            <img src="${item.src}" alt="${item.name}" class="praise-sticker-img" draggable="false" />
        </div>
    `;
}

function renderStickerPickerGrid() {
    const gridContainer = document.getElementById("sticker-select-grid");
    if (!gridContainer) return;
    gridContainer.innerHTML = "";

    if (selectedStickerType < 0 || selectedStickerType >= PRAISE_STICKERS.length) {
        selectedStickerType = 0;
    }

    PRAISE_STICKERS.forEach(sticker => {
        const isSel = sticker.id === selectedStickerType;
        const item = document.createElement("div");
        item.className = "sticker-option-item" + (isSel ? " selected" : "");
        item.dataset.stickerId = sticker.id;
        item.innerHTML = `
            <div class="sticker-option-icon">
                <img src="${sticker.src}" alt="${sticker.name}" draggable="false" />
            </div>
            <span class="sticker-option-label">${sticker.name}</span>
        `;

        const selectHandler = (e) => {
            if (e) e.stopPropagation();
            selectedStickerType = sticker.id;
            gridContainer.querySelectorAll(".sticker-option-item").forEach(el => el.classList.remove("selected"));
            item.classList.add("selected");
        };

        item.addEventListener("click", selectHandler);
        item.addEventListener("touchstart", selectHandler, { passive: true });

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
                } catch (e) { }
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
                    } catch (e) { }
                }
            }
            boards.sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));
            return boards;
        }
    }
}

// 다음 순차적 보드 코드 생성 (기존 보드 BON_WOOK -> 두번째 보드는 BON_WOOK_1, 세번째는 BON_WOOK_2)
async function getNextSequentialBoardCode(baseBoardId) {
    const allBoards = await apiGetAllBoards();
    let sourceId = baseBoardId || currentBoardId || "BON_WOOK";
    if (sourceId === "DEFAULT" || sourceId === "TEST-COSMIC-BOARD" || sourceId === "1") {
        sourceId = "BON_WOOK";
    }
    
    let basePrefix = String(sourceId).trim().toUpperCase();
    basePrefix = basePrefix.replace(/_\d+$/, "").replace(/\d+$/, "");
    if (basePrefix.endsWith("_")) {
        basePrefix = basePrefix.slice(0, -1);
    }
    if (!basePrefix || basePrefix === "1") basePrefix = "BON_WOOK";

    let maxNum = 0;

    allBoards.forEach(b => {
        if (b && b.id) {
            const idStr = String(b.id).trim().toUpperCase();
            if (idStr.startsWith(basePrefix)) {
                const match = idStr.match(new RegExp(`^${basePrefix.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}_?(\\d+)$`, "i"));
                if (match) {
                    const num = parseInt(match[1], 10);
                    if (!isNaN(num) && num > maxNum) {
                        maxNum = num;
                    }
                }
            }
        }
    });

    const nextNum = maxNum + 1;
    return `${basePrefix}_${nextNum}`;
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
    const filtered = parsed.filter(b => isMoonBoard(b));
    if (parsed.length !== filtered.length) {
        localStorage.setItem("registered_boards", JSON.stringify(filtered));
    }
    return filtered.map(b => {
        if (b && b.title && (b.title.includes("우주") || b.title.includes("칭찬나라") || b.title.includes("스티커핀"))) {
            b.title = "스티커판";
        }
        return b;
    });
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

    const combinedList = Array.from(boardMap.values()).filter(b => isMoonBoard(b) && !b.id.startsWith("TEST-") && !b.id.startsWith("TEST_"));

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

    const canEditNow = localStorage.getItem("is_editor") === "true";
    const fingerprint = canEditNow + '#' + combinedList.map(b => `${b.id}:${b.title}:${b.reward_text}:${b.id === currentBoardId}`).join('|');

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

// HTML 삽입 전 특수문자 이스케이프 (공유 코드로 불러온 보드 제목/보상 보호)
function escapeHtml(value) {
    return String(value == null ? "" : value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

// 보드 아이템 DOM 요소 생성 헬퍼
function createBoardItemDOM(board, isLocal) {
    const isActive = board.id === currentBoardId;
    const item = document.createElement("div");
    item.className = `board-item ${isActive ? "active" : ""}`;
    item.dataset.boardId = board.id;

    const hasPermission = localStorage.getItem("is_editor") === "true";

    const editButtonHtml = `
        <button class="btn-edit-board" title="스티커판 정보 수정" aria-label="스티커판 정보 수정">
            <span class="material-icons" style="font-size: 16px;">edit</span>
        </button>
    `;

    const deleteButtonHtml = (isLocal && hasPermission) ? `
        <button class="btn-delete-board" title="삭제" aria-label="스티커판 삭제">
            <span class="material-icons" style="font-size: 16px;">delete</span>
        </button>
    ` : '';

    // 마우스 환경(PC)에서 바로 끌어서 순서를 바꿀 수 있는 핸들 (편집 권한일 때만)
    const dragHandleHtml = hasPermission
        ? `<span class="material-icons drag-handle" title="끌어서 순서 변경" aria-hidden="true">drag_indicator</span>`
        : '';

    item.innerHTML = `
        ${dragHandleHtml}
        <div class="board-item-info">
            <span class="board-item-title">${escapeHtml(board.title)}</span>
            <span class="board-item-code">보상: ${escapeHtml(board.reward_text || '없음')}</span>
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

        // PC: 드래그 핸들을 잡으면 롱프레스 대기 없이 즉시 순서 변경 시작
        const fromHandle = e.type === 'mousedown' && !!e.target.closest(".drag-handle");
        if (fromHandle) e.preventDefault();

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
        }, fromHandle ? 0 : 350);
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

            setTimeout(() => {
                isReorderDrag = false;
            }, 100);
        } else {
            isReorderDrag = false;
        }
    };

    const endPressHandler = () => {
        if (!isDragging && pressTimer) {
            clearTimeout(pressTimer);
            pressTimer = null;
        }
    };

    item.addEventListener("mousedown", startDragHandler);
    item.addEventListener("mousemove", cancelTimerHandler);
    item.addEventListener("mouseup", endPressHandler);
    item.addEventListener("mouseleave", endPressHandler);

    item.addEventListener("touchstart", startDragHandler, { passive: true });
    item.addEventListener("touchmove", cancelTimerHandler, { passive: true });
    item.addEventListener("touchend", endPressHandler);
    item.addEventListener("touchcancel", endPressHandler);

    const btnEdit = item.querySelector(".btn-edit-board");
    if (btnEdit) {
        btnEdit.addEventListener("mousedown", (e) => e.stopPropagation());
        btnEdit.addEventListener("mouseup", (e) => e.stopPropagation());
        btnEdit.addEventListener("touchstart", (e) => e.stopPropagation(), { passive: true });
        btnEdit.addEventListener("touchend", (e) => e.stopPropagation(), { passive: true });

        btnEdit.addEventListener("click", (e) => {
            e.stopPropagation();
            e.preventDefault();
            openBoardEditModal(board);
        });
    }

    if (isLocal && hasPermission) {
        const btnDelete = item.querySelector(".btn-delete-board");
        if (btnDelete) {
            btnDelete.addEventListener("mousedown", (e) => e.stopPropagation());
            btnDelete.addEventListener("mouseup", (e) => e.stopPropagation());
            btnDelete.addEventListener("touchstart", (e) => e.stopPropagation(), { passive: true });
            btnDelete.addEventListener("touchend", (e) => e.stopPropagation(), { passive: true });

            btnDelete.addEventListener("click", (e) => {
                e.stopPropagation();
                e.preventDefault();
                deleteTargetBoardId = board.id;
                deleteTargetIndex = null;
                deleteConfirmText.textContent = `'${board.title}' 판을 삭제하시겠습니까?\n(실제 데이터와 스티커가 모두 영구 삭제됩니다.)`;
                modalDelete.classList.remove("hidden");
            });
        }
    }

    return item;
}

// ==========================================
// 6. UI 업데이트 및 렌더링 로직
// ==========================================

let realtimeChannel = null;
function setupRealtimeSubscription(boardId) {
    if (!supabaseClient || !boardId || isLocalMode) return;
    if (realtimeChannel) {
        supabaseClient.removeChannel(realtimeChannel);
        realtimeChannel = null;
    }
    try {
        realtimeChannel = supabaseClient
            .channel(`public:praise_stickers:${boardId}`)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'praise_stickers', filter: `board_id=eq.${boardId}` },
                (payload) => {
                    const newRecord = payload.new;
                    if (newRecord && newRecord.sticker_index === 999) {
                        const match = (newRecord.memo || "").match(/\[theme:(#[0-9A-Fa-f]{6})\]/);
                        if (match) {
                            applyThemeColor(match[1], false);
                        }
                    } else {
                        refreshApp();
                    }
                }
            )
            .subscribe();
    } catch (e) {
        console.warn("Realtime 구독 설정 에러:", e);
    }
}

// 현재 화면 리프레시
async function refreshApp() {
    try {
        // 1. 보드 정보 로드
        let board = await apiGetBoard(currentBoardId);
        if (!board || !isMoonBoard(board)) {
            const registered = getRegisteredBoards();
            if (registered.length > 0 && isMoonBoard(registered[0])) {
                currentBoardId = registered[0].id;
                localStorage.setItem("current_board_id", currentBoardId);
                board = await apiGetBoard(currentBoardId);
            } else {
                currentBoardId = "BON_WOOK";
                localStorage.setItem("current_board_id", currentBoardId);
                board = await apiGetBoard(currentBoardId);
                if (!board) {
                    currentBoardId = "TEST-COSMIC-BOARD";
                    localStorage.setItem("current_board_id", currentBoardId);
                    board = await apiGetBoard(currentBoardId);
                }
            }
        }
        if (!board && (currentBoardId === "DEFAULT" || !currentBoardId)) {
            currentBoardId = "TEST-COSMIC-BOARD";
            localStorage.setItem("current_board_id", currentBoardId);
            board = await apiGetBoard(currentBoardId);
        }

        if (!board) {
            // 보드가 존재하지 않음 -> 초기 설정 화면 노출
            appContent.classList.add("hidden");
            welcomeScreen.classList.remove("hidden");

            // 설정 폼에 현재 보드 ID 자동 완성 및 테스트값 미리 채우기
            if (currentBoardId === "DEFAULT" || currentBoardId.startsWith("TEST-")) {
                setupBoardId.value = currentBoardId === "DEFAULT" ? "TEST-COSMIC-BOARD" : currentBoardId;
                setupTitle.value = "스티커판 💖";
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
        if (board) {
            if (board.title && (board.title.includes("우주") || board.title.includes("칭찬나라") || board.title.includes("스티커핀"))) {
                board.title = "스티커판";
            }
            if (board.app_title && (board.app_title.includes("우주") || board.app_title.includes("칭찬나라") || board.app_title.includes("스티커핀"))) {
                board.app_title = "스티커판";
            }
        }
        currentBoard = board;
        if (board && board.editor_pin) {
            localStorage.setItem(`board_pin_${board.id}`, board.editor_pin);
        }
        setupRealtimeSubscription(board.id);

        // 로컬 보드 목록 관리 및 갱신
        addRegisteredBoard(board.id, board.title, board.reward_text);
        renderBoardList();

        // 2. 스티커 정보 로드
        const rawStickers = await apiGetStickers(currentBoardId);

        // 2.5 테마 메타데이터(sticker_index === 999) 감지 및 즉시 적용
        const themeMeta = rawStickers.find(s => s.sticker_index === 999);
        let activeThemeColor = (currentBoard && currentBoard.theme_color) || localStorage.getItem(`board_theme_color_${currentBoardId}`) || "#4A5568";
        if (themeMeta && themeMeta.memo) {
            const match = themeMeta.memo.match(/\[theme:(#[0-9A-Fa-f]{6})\]/);
            if (match) {
                activeThemeColor = match[1];
                localStorage.setItem(`board_theme_color_${currentBoardId}`, activeThemeColor);
                if (currentBoard) currentBoard.theme_color = activeThemeColor;
            }
        }
        applyThemeColor(activeThemeColor, false);

        // 실제 보드에 표시할 스티커만 필터링 (index < 100)
        currentStickers = rawStickers.filter(s => s.sticker_index < 100);
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
                slot.setAttribute("aria-label", `${i + 1}번째 칸, ${isActive ? "스티커 붙음" : "비어 있음"}`);
                slot.innerHTML = `
                    ${getSeaCreatureStickerSvg(i, isActive, rawMemo)}
                    <span class="slot-number">${i + 1}</span>
                `;
            }
        }

        // 5. 모달 내의 필드 업데이트 (현재 설정 대입)
        let savedAppTitle = (currentBoard && currentBoard.app_title) || localStorage.getItem(`app_title_${currentBoardId}`) || localStorage.getItem("global_app_title") || "스티커판";
        if (savedAppTitle.includes("우주") || savedAppTitle.includes("칭찬나라") || savedAppTitle.includes("스티커핀")) {
            savedAppTitle = "스티커판";
            localStorage.setItem("global_app_title", "스티커판");
            localStorage.setItem(`app_title_${currentBoardId}`, "스티커판");
        }
        if (appMainLogo) appMainLogo.textContent = savedAppTitle;
        if (editAppTitle) editAppTitle.value = savedAppTitle;
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
    slot.setAttribute("role", "button");
    slot.setAttribute("tabindex", "0");

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

    // PC: 마우스 우클릭으로 스티커 떼기 (터치 기기의 롱프레스 메뉴와 중복되지 않도록 마우스 환경에서만)
    slot.addEventListener("contextmenu", (e) => {
        if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
        const stickerData = currentStickers.find(s => s.sticker_index === i);
        if (!stickerData) return;
        e.preventDefault();
        cancelPress();
        preventClick = false;
        handleSlotLongPress(i, true);
    });

    // 키보드: Enter/Space = 클릭, Delete/Backspace = 스티커 떼기
    slot.addEventListener("keydown", (e) => {
        if (e.target !== slot) return;
        const stickerData = currentStickers.find(s => s.sticker_index === i);
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleSlotClick(i, !!stickerData);
        } else if ((e.key === "Delete" || e.key === "Backspace") && stickerData) {
            e.preventDefault();
            handleSlotLongPress(i, true);
        }
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
            if (btnMemoRemove) btnMemoRemove.classList.remove("hidden");
        } else {
            btnMemoEditStart.classList.add("hidden");
            if (btnMemoRemove) btnMemoRemove.classList.add("hidden");
        }

        modalMemoView.classList.remove("hidden");
    } else {
        // 빈칸 클릭 시: 편집자만 스티커 선택 & 메모 작성 모달 노출
        if (!isEditorMode) {
            showToast("스티커 추가는 여자친구(편집자)만 가능해요! 🧸");
            return;
        }
        memoTargetIndex = index;
        if (typeof selectedStickerType === "undefined" || selectedStickerType === null || selectedStickerType < 0 || selectedStickerType >= PRAISE_STICKERS.length) {
            selectedStickerType = 0;
        }
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
    const pin = inputPin.value.trim();
    const requiredPin = (currentBoard && currentBoard.editor_pin) || localStorage.getItem(`board_pin_${currentBoardId}`) || "1234";

    if (pin === requiredPin) {
        isEditorMode = true;
        localStorage.setItem("is_editor", "true");
        localStorage.setItem(`board_pin_${currentBoardId}`, pin);
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
// 새 칭찬판 만들기 다이얼로그 노출
if (btnShare) {
    btnShare.addEventListener("click", () => {
        modalShare.classList.remove("hidden");
        inputCreateBoardTitle.value = "";
        inputCreateBoardTitle.focus();
    });
}

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

    const activeColor = (currentBoard && currentBoard.theme_color) || localStorage.getItem(`board_theme_color_${currentBoardId}`) || "#EC4899";
    const activePin = (currentBoard && currentBoard.editor_pin) || localStorage.getItem(`board_pin_${currentBoardId}`) || "1234";

    const newBoard = {
        id: finalCode,
        title: finalTitle,
        target_count: 30,
        reward_text: "새로운 선물 지정하기",
        editor_pin: activePin,
        created_at: new Date().toISOString()
    };

    const result = await apiCreateBoard(newBoard);
    if (result.success) {
        currentBoardId = finalCode;
        localStorage.setItem("current_board_id", finalCode);
        localStorage.setItem(`board_pin_${finalCode}`, activePin);
        localStorage.setItem(`board_theme_color_${finalCode}`, activeColor);
        await apiSaveThemeColor(finalCode, activeColor);
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

// ==========================================
// RGB 색상 팔레트 및 테마 제어 로직
// ==========================================

function hexToRgb(hex) {
    if (!hex) return { r: 74, g: 85, b: 104 };
    hex = hex.replace(/^#/, '');
    if (hex.length === 3) {
        hex = hex.split('').map(c => c + c).join('');
    }
    const num = parseInt(hex, 16);
    return {
        r: (num >> 16) & 255,
        g: (num >> 8) & 255,
        b: num & 255
    };
}

function rgbToHex(r, g, b) {
    const toHex = (c) => {
        const hex = Math.max(0, Math.min(255, c)).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

function adjustColorBrightness(hex, percent) {
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

function updatePaletteUI(hex) {
    if (!hex) hex = "#4A5568";
    hex = hex.toUpperCase();
    const { r, g, b } = hexToRgb(hex);

    if (rangeR) rangeR.value = r;
    if (rangeG) rangeG.value = g;
    if (rangeB) rangeB.value = b;
    if (valR) valR.textContent = r;
    if (valG) valG.textContent = g;
    if (valB) valB.textContent = b;
    if (inputCustomColor) inputCustomColor.value = hex;

    if (colorPreviewBox) {
        colorPreviewBox.style.backgroundColor = hex;
    }
    if (colorPreviewText) {
        colorPreviewText.textContent = hex;
    }

    const presetBtns = document.querySelectorAll(".color-preset-btn");
    presetBtns.forEach(btn => {
        if (btn.getAttribute("data-color").toUpperCase() === hex) {
            btn.classList.add("active");
        } else {
            btn.classList.remove("active");
        }
    });
}

function applyThemeColor(hex, save = false) {
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
    document.documentElement.style.setProperty("--on-primary-hover", useDarkText ? "rgba(0, 0, 0, 0.12)" : "rgba(255, 255, 255, 0.2)");

    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) metaTheme.setAttribute("content", hex);

    if (save && currentBoardId) {
        localStorage.setItem(`board_theme_color_${currentBoardId}`, hex);
        if (currentBoard) {
            currentBoard.theme_color = hex;
        }
        apiSaveThemeColor(currentBoardId, hex);
    }
}

// 팔레트 모달 이벤트 핸들러 바인딩
if (btnColorPalette) {
    btnColorPalette.addEventListener("click", () => {
        if (!isEditorMode) {
            modalPin.classList.remove("hidden");
            if (inputPin) inputPin.focus();
            showToast("테마 색상 변경은 편집자 권한(비밀번호 PIN 인증)이 필요합니다. 🔒");
            return;
        }
        const savedColor = (currentBoard && currentBoard.theme_color) || localStorage.getItem(`board_theme_color_${currentBoardId}`) || "#4A5568";
        updatePaletteUI(savedColor);
        modalColorPalette.classList.remove("hidden");
    });
}

if (btnColorClose) {
    btnColorClose.addEventListener("click", () => {
        modalColorPalette.classList.add("hidden");
    });
}

function onRgbSliderChange() {
    const r = parseInt(rangeR.value, 10) || 0;
    const g = parseInt(rangeG.value, 10) || 0;
    const b = parseInt(rangeB.value, 10) || 0;
    const hex = rgbToHex(r, g, b);
    updatePaletteUI(hex);
}

if (rangeR) rangeR.addEventListener("input", onRgbSliderChange);
if (rangeG) rangeG.addEventListener("input", onRgbSliderChange);
if (rangeB) rangeB.addEventListener("input", onRgbSliderChange);

if (inputCustomColor) {
    inputCustomColor.addEventListener("input", (e) => {
        updatePaletteUI(e.target.value);
    });
}

document.querySelectorAll(".color-preset-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        const color = btn.getAttribute("data-color");
        updatePaletteUI(color);
    });
});

if (btnColorReset) {
    btnColorReset.addEventListener("click", () => {
        if (!isEditorMode) {
            showToast("편집 권한이 필요합니다. 🔒");
            return;
        }
        updatePaletteUI("#4A5568");
        applyThemeColor("#4A5568", true);
        showToast("테마 색상이 기본값(#4A5568)으로 초기화되었습니다.");
    });
}

if (btnColorApply) {
    btnColorApply.addEventListener("click", () => {
        if (!isEditorMode) {
            showToast("편집 권한이 필요합니다. 🔒");
            return;
        }
        const r = parseInt(rangeR.value, 10) || 0;
        const g = parseInt(rangeG.value, 10) || 0;
        const b = parseInt(rangeB.value, 10) || 0;
        const hex = rgbToHex(r, g, b);
        applyThemeColor(hex, true);
        modalColorPalette.classList.add("hidden");
        showToast(`테마 색상이 ${hex} (으)로 변경되었습니다! 🎨`);
    });
}

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

    const newAppTitle = editAppTitle ? editAppTitle.value.trim() : "";
    const newPin = editPin.value.trim();
    const newReaderName = editReaderName.value.trim();
    const newEditorName = editEditorName.value.trim();

    if (newAppTitle) {
        localStorage.setItem(`app_title_${currentBoardId}`, newAppTitle);
        localStorage.setItem("global_app_title", newAppTitle);
        if (appMainLogo) appMainLogo.textContent = newAppTitle;
    }
    if (newPin) localStorage.setItem(`board_pin_${currentBoardId}`, newPin);
    localStorage.setItem("global_reader_role_name", newReaderName);
    localStorage.setItem("global_editor_role_name", newEditorName);

    const updated = {
        ...currentBoard,
        app_title: newAppTitle || (currentBoard && currentBoard.app_title) || "스티커판",
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

// 스티커 제거 또는 스티커판 삭제 확인 처리
btnDeleteConfirm.addEventListener("click", async () => {
    loadingSpinner.classList.remove("hidden");
    modalDelete.classList.add("hidden");

    // (A) 스티커판(보드) 삭제 처리
    if (deleteTargetBoardId) {
        const boardIdToDelete = deleteTargetBoardId;
        deleteTargetBoardId = null;
        const wasActive = boardIdToDelete === currentBoardId;

        await apiDeleteBoard(boardIdToDelete);
        removeRegisteredBoard(boardIdToDelete);

        if (wasActive) {
            sidebar.classList.remove("open");
            sidebarOverlay.classList.add("hidden");
            isEditorMode = localStorage.getItem("is_editor") === "true";
            updateRoleUI();
            const newUrl = `${window.location.origin}${window.location.pathname}?board=${currentBoardId}`;
            window.history.replaceState({ path: newUrl }, "", newUrl);
            await refreshApp();
        } else {
            renderBoardList();
            loadingSpinner.classList.add("hidden");
        }
        showToast("스티커판이 완전히 삭제되었습니다. 🗑️");
        return;
    }

    // (B) 스티커 제거 처리
    if (deleteTargetIndex === null) {
        loadingSpinner.classList.add("hidden");
        return;
    }

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
    deleteTargetBoardId = null;
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
        const stickerName = PRAISE_STICKERS[selectedStickerType] ? PRAISE_STICKERS[selectedStickerType].name : "칭찬";
        showToast(`${memoTargetIndex + 1}번째 칸에 ${stickerName} 스티커 부착 완료! ✨💖`);
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
    if (btnMemoRemove) btnMemoRemove.classList.add("hidden");
    btnMemoViewClose.classList.add("hidden");
    btnMemoEditCancel.classList.remove("hidden");
    btnMemoEditSave.classList.remove("hidden");

    inputEditStickerMemo.focus();
});

// 메모 보기 모달에서 바로 스티커 떼기 (PC·키보드용 대체 수단)
if (btnMemoRemove) {
    btnMemoRemove.addEventListener("click", () => {
        if (!isEditorMode || editTargetIndex === null) return;
        deleteTargetIndex = editTargetIndex;
        deleteTargetBoardId = null;
        deleteConfirmText.textContent = "스티커를 떼겠습니까?";
        modalMemoView.classList.add("hidden");
        modalDelete.classList.remove("hidden");
    });
}

// 메모 수정 취소
btnMemoEditCancel.addEventListener("click", () => {
    document.querySelector("#modal-memo-view .memo-view-content").classList.remove("hidden");
    memoEditArea.classList.add("hidden");

    btnMemoEditStart.classList.remove("hidden");
    if (btnMemoRemove) btnMemoRemove.classList.remove("hidden");
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
    const keepType = parsed.type !== null ? (parsed.type % PRAISE_STICKERS.length) : (editTargetIndex % PRAISE_STICKERS.length);
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

// 모든 모달 배경(바탕/어두운 영역) 클릭 시 모달 닫기 이벤트 핸들러
document.querySelectorAll(".modal-overlay").forEach(overlay => {
    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
            overlay.classList.add("hidden");
            
            if (overlay.id === "modal-memo-view") {
                editTargetIndex = null;
                const memoViewContent = document.querySelector("#modal-memo-view .memo-view-content");
                if (memoViewContent) memoViewContent.classList.remove("hidden");
                if (memoEditArea) memoEditArea.classList.add("hidden");
                if (btnMemoEditCancel) btnMemoEditCancel.classList.add("hidden");
                if (btnMemoEditSave) btnMemoEditSave.classList.add("hidden");
                if (btnMemoViewClose) btnMemoViewClose.classList.remove("hidden");
            } else if (overlay.id === "modal-memo-input") {
                memoTargetIndex = null;
            } else if (overlay.id === "modal-delete") {
                deleteTargetIndex = null;
                deleteTargetBoardId = null;
            } else if (overlay.id === "modal-pin") {
                const pinError = document.getElementById("pin-error");
                if (pinError) pinError.classList.add("hidden");
            }
        }
    });
});

// ==========================================
// 8.5 키보드 · 접근성 (PC / 태블릿 외장 키보드 지원)
// ==========================================

// 모달/아이콘 버튼에 접근성 속성 부여
document.querySelectorAll(".modal-content").forEach(el => {
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-modal", "true");
    const title = el.querySelector(".modal-title");
    if (title) el.setAttribute("aria-label", title.textContent.trim());
});
document.querySelectorAll("button[title]").forEach(btn => {
    if (!btn.hasAttribute("aria-label")) btn.setAttribute("aria-label", btn.getAttribute("title"));
});

// Enter(입력창) / Ctrl+Enter(메모 입력창)로 확인 버튼 누르기
const ENTER_SUBMIT_MAP = {
    "input-pin": btnPinSubmit,
    "input-switch-board": btnSwitchBoard,
    "input-create-board-title": btnCreateBoard,
    "setup-board-id": btnSetupSubmit,
    "setup-title": btnSetupSubmit,
    "setup-target-count": btnSetupSubmit,
    "setup-reward": btnSetupSubmit,
    "setup-pin": btnSetupSubmit,
    "edit-board-title": btnBoardEditSave,
    "edit-board-target-count": btnBoardEditSave,
    "edit-board-reward": btnBoardEditSave
};
const CTRL_ENTER_SUBMIT_MAP = {
    "input-sticker-memo": btnMemoSubmit,
    "input-edit-sticker-memo": btnMemoEditSave
};

document.addEventListener("keydown", (e) => {
    // 한글 등 IME 조합 중에는 무시
    if (e.isComposing || e.keyCode === 229) return;

    if (e.key === "Escape") {
        // 가장 위에 떠 있는 모달부터 닫기
        const openModals = Array.from(document.querySelectorAll(".modal-overlay:not(.hidden)"));
        if (openModals.length > 0) {
            e.preventDefault();
            openModals[openModals.length - 1].click(); // 배경 클릭과 동일한 정리 로직 재사용
            return;
        }
        if (sidebar && sidebar.classList.contains("open")) {
            sidebar.classList.remove("open");
            sidebarOverlay.classList.add("hidden");
        }
        return;
    }

    if (e.key === "Enter") {
        const id = e.target && e.target.id;
        if (id && ENTER_SUBMIT_MAP[id]) {
            e.preventDefault();
            ENTER_SUBMIT_MAP[id].click();
        } else if (id && CTRL_ENTER_SUBMIT_MAP[id] && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            CTRL_ENTER_SUBMIT_MAP[id].click();
        }
    }
});

// ==========================================
// 9. 앱 초기 구동 및 실시간 데이터 싱크 폴링
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    // 1. 기존 데모/더미 데이터 로컬스토리지 캐시 정리
    localStorage.removeItem("board_DEFAULT");
    localStorage.removeItem("stickers_DEFAULT");

    // [소독 패치] 로컬스토리지 내 타 폴더 및 테스트 칭찬판 찌꺼기 100% 완전 정제 (프라이버시 보호)
    try {
        const boards = JSON.parse(localStorage.getItem("registered_boards") || "[]");
        const cleaned = boards.filter(b => isMoonBoard(b));
        localStorage.setItem("registered_boards", JSON.stringify(cleaned));

        // 현재 선택된 보드가 달 보드가 아니면 안전한 달 보드로 강제 전환
        let curId = localStorage.getItem("current_board_id");
        if (!curId || !isMoonBoard(curId)) {
            const fallbackId = (cleaned.length > 0) ? cleaned[0].id : "BON_WOOK";
            localStorage.setItem("current_board_id", fallbackId);
            currentBoardId = fallbackId;
        }

        // 보드 정렬 순서 정제
        const order = JSON.parse(localStorage.getItem("board_order") || "[]");
        const cleanedOrder = order.filter(id => isMoonBoard(id));
        localStorage.setItem("board_order", JSON.stringify(cleanedOrder));

        // 타 앱 보드 개별 캐시 찌꺼기 완전 삭제
        for (let i = localStorage.length - 1; i >= 0; i--) {
            const k = localStorage.key(i);
            if (k && (k.startsWith("board_") || k.startsWith("stickers_"))) {
                const subId = k.replace("board_", "").replace("stickers_", "");
                if (!isMoonBoard(subId)) {
                    localStorage.removeItem(k);
                }
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

// 모바일 브라우저 백그라운드/네트워크 3초 자동 동기화 헬퍼 (편집자 테마 색상 및 스티커 실시간 동기화)
let syncInterval = null;
function startAutoSync() {
    if (syncInterval) clearInterval(syncInterval);
    syncInterval = setInterval(async () => {
        if (!document.hidden && currentBoardId) {
            const rawStickers = await apiGetStickers(currentBoardId);
            const themeMeta = rawStickers.find(s => s.sticker_index === 999);
            if (themeMeta && themeMeta.memo) {
                const match = themeMeta.memo.match(/\[theme:(#[0-9A-Fa-f]{6})\]/);
                if (match) {
                    const remoteColor = match[1];
                    const localColor = localStorage.getItem(`board_theme_color_${currentBoardId}`);
                    if (remoteColor !== localColor) {
                        localStorage.setItem(`board_theme_color_${currentBoardId}`, remoteColor);
                        if (currentBoard) currentBoard.theme_color = remoteColor;
                        applyThemeColor(remoteColor, false);
                    }
                }
            }
        }
    }, 3000);
}

    // 탭 전환 시(앱으로 다시 돌아왔을 때) 1회 자동 동기화
    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") {
            refreshApp();
        }
    });

    startAutoSync();
});
