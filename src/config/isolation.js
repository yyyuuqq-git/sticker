// ==========================================
// 스티커판 격리 및 로컬 스토리지 관리 모듈
// ==========================================
import { APP_STORAGE_PREFIX } from "./constants";

/**
 * 달 스티커판 전용 엄격한 화이트리스트 검증 함수
 * 타 앱(고양이, 건, 채소가게, 수산시장/0427, 1 등)의 보드를 100% 원천 차단
 */
export function isMoonBoard(b) {
  if (!b) return false;
  const idStr = String(typeof b === "string" ? b : (b.id || "")).toUpperCase().trim();
  const titleStr = String(typeof b === "object" && b.title ? b.title : "").toUpperCase().trim();

  // 1. 테스트 보드 배제 (레거시 TEST-COSMIC-BOARD는 허용)
  if (idStr.startsWith("TEST-BOARD") || idStr.startsWith("TEST_BOARD") || idStr === "TEST-BOARD" || idStr === "TEST_BOARD") return false;
  if (idStr.startsWith("TEST_") && !idStr.includes("COSMIC")) return false;
  if (titleStr.includes("테스트") && !idStr.includes("COSMIC") && !titleStr.includes("우주") && !titleStr.includes("달")) return false;

  // 2. 다른 앱 보드 배제 (건, 고양이, 채소가게, 수산시장 FISH 100% 프라이버시 격리, 레거시 숫자 보드 0427, 1 허용)
  if (
    idStr.startsWith("GUN") || idStr.startsWith("CAT") || idStr.includes("KITTY") || idStr.includes("MEOW") ||
    idStr.startsWith("FISH") || idStr.startsWith("CHAEDO") || idStr.includes("VEGE") || idStr.includes("VEGETABLE")
  ) {
    return false;
  }
  if (
    (titleStr.includes("양건") || titleStr.includes("수산시장") || titleStr.includes("물고기") || titleStr.includes("생선") ||
    titleStr.includes("어시장") || titleStr.includes("채건") || titleStr.includes("채소") || titleStr.includes("야채") ||
    titleStr.includes("건이")) && idStr !== "0427"
  ) {
    return false;
  }

  // 3. 달/우주 전용 화이트리스트 일치 판정 (BON_WOOK 접두사 및 숫자 보드 0427, 1 허용)
  if (idStr.startsWith("BON_WOOK") || idStr.startsWith("MOON") || idStr.startsWith("LUNAR") || idStr === "0427" || idStr === "1" || idStr === "TEST-COSMIC-BOARD") return true;
  if (
    titleStr.includes("달") || titleStr.includes("우주") || titleStr.includes("별") || titleStr.includes("스티치") ||
    titleStr.includes("욱이") || titleStr.includes("째욱")
  ) return true;

  if (typeof b === "object" && b) {
    if (b.theme === "moon" || b.app === "moon") return true;
    if (b.custom_labels && typeof b.custom_labels === "object" && b.custom_labels.app === "moon") return true;
  }

  // 그 외 일치하지 않는 보드는 100% 거부
  return false;
}

export function getAppStorage(key, fallback = null) {
  try {
    const val = localStorage.getItem(APP_STORAGE_PREFIX + key);
    if (val !== null) return val;

    // 기존 레거시 키 호환 지원 (보드 관련 정보는 해당 앱 전용 검증 통과 시에만 승계)
    const legacyVal = localStorage.getItem(key);
    if (legacyVal !== null) {
      if (key === "current_board_id") {
        if (isMoonBoard(legacyVal)) {
          localStorage.setItem(APP_STORAGE_PREFIX + key, legacyVal);
          return legacyVal;
        }
        return fallback;
      }
      if (key === "registered_boards") {
        try {
          const list = JSON.parse(legacyVal);
          const filtered = list.filter(b => isMoonBoard(b));
          if (filtered.length > 0) {
            const filteredStr = JSON.stringify(filtered);
            localStorage.setItem(APP_STORAGE_PREFIX + key, filteredStr);
            return filteredStr;
          }
        } catch {
          // ignore error
        }
        return fallback;
      }
      return legacyVal;
    }
  } catch (e) {
    console.warn("getAppStorage error:", e);
  }
  return fallback;
}

export function setAppStorage(key, val) {
  try {
    localStorage.setItem(APP_STORAGE_PREFIX + key, String(val));
  } catch (e) {
    console.warn("setAppStorage error:", e);
  }
}

export function removeAppStorage(key) {
  try {
    localStorage.removeItem(APP_STORAGE_PREFIX + key);
  } catch (e) {
    console.warn("removeAppStorage error:", e);
  }
}

export function getRegisteredBoards() {
  const list = getAppStorage("registered_boards");
  let parsed = [];
  try {
    parsed = list ? JSON.parse(list) : [];
  } catch {
    parsed = [];
  }
  const filtered = parsed.filter(b => isMoonBoard(b));
  if (parsed.length !== filtered.length) {
    setAppStorage("registered_boards", JSON.stringify(filtered));
  }
  return filtered.map(b => {
    if (b && b.title && (b.title.includes("우주") || b.title.includes("칭찬나라") || b.title.includes("스티커핀"))) {
      b.title = "스티커판";
    }
    return b;
  });
}

export function addRegisteredBoard(boardId, title, rewardText) {
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
  setAppStorage("registered_boards", JSON.stringify(list));
  return list;
}

export function getBoardOrder() {
  const saved = getAppStorage("board_order");
  try {
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function saveBoardOrder(orderedIds) {
  setAppStorage("board_order", JSON.stringify(orderedIds));

  let list = getRegisteredBoards();
  list.sort((a, b) => {
    const idxA = orderedIds.indexOf(a.id);
    const idxB = orderedIds.indexOf(b.id);
    if (idxA === -1) return 1;
    if (idxB === -1) return -1;
    return idxA - idxB;
  });
  setAppStorage("registered_boards", JSON.stringify(list));
  return list;
}

export function removeRegisteredBoard(boardId, currentBoardId) {
  let list = getRegisteredBoards();
  list = list.filter(b => b.id !== boardId);
  setAppStorage("registered_boards", JSON.stringify(list));

  const orderList = getBoardOrder().filter(id => id !== boardId);
  setAppStorage("board_order", JSON.stringify(orderList));

  let nextBoardId = currentBoardId;
  if (currentBoardId === boardId) {
    if (list.length > 0) {
      nextBoardId = list[0].id;
    } else {
      nextBoardId = "DEFAULT";
    }
    setAppStorage("current_board_id", nextBoardId);
  }
  return { updatedList: list, nextBoardId };
}
