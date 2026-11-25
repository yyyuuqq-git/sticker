// ==========================================
// Supabase 백엔드 통신 및 데이터 API 모듈
// ==========================================
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "../config/constants";
import { isMoonBoard, addRegisteredBoard } from "../config/isolation";

export const supabase =
  SUPABASE_URL && SUPABASE_ANON_KEY
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

export const isLocalMode = !supabase;

export function parseStickerMemo(rawMemo) {
  if (!rawMemo) return { type: null, memo: "" };
  const match = String(rawMemo).match(/^\[type:(\d+)\]\s*(.*)/s);
  if (match) {
    return { type: parseInt(match[1], 10), memo: match[2] };
  }
  return { type: null, memo: rawMemo };
}

export function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const date = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");

  return `${year}년 ${month}월 ${date}일 ${hours}:${minutes}`;
}

export async function apiGetBoard(boardId) {
  if (!isMoonBoard(boardId)) return null;

  if (isLocalMode) {
    const localData = localStorage.getItem(`board_${boardId}`);
    return localData ? JSON.parse(localData) : null;
  }

  try {
    const { data, error } = await supabase
      .from("praise_boards")
      .select("*")
      .eq("id", boardId)
      .single();

    if (error || !data) {
      const localData = localStorage.getItem(`board_${boardId}`);
      return localData ? JSON.parse(localData) : null;
    }

    if (!isMoonBoard(data)) {
      console.warn("보드 차단됨 (타 앱 보드):", boardId);
      return null;
    }

    localStorage.setItem(`board_${boardId}`, JSON.stringify(data));
    return data;
  } catch (e) {
    console.error("apiGetBoard 에러:", e);
    const localData = localStorage.getItem(`board_${boardId}`);
    return localData ? JSON.parse(localData) : null;
  }
}

export async function apiCreateBoard(board) {
  localStorage.setItem(`board_${board.id}`, JSON.stringify(board));
  if (board.theme_color) {
    localStorage.setItem(`board_theme_color_${board.id}`, board.theme_color);
  }

  if (isLocalMode) {
    return { success: true };
  }

  try {
    const dbPayload = {
      id: board.id,
      title: board.title,
      goal_count: board.goal_count || 30,
      reward_text: board.reward_text || "",
      editor_pin: board.editor_pin || "1234",
    };

    const { data, error } = await supabase
      .from("praise_boards")
      .upsert(dbPayload, { onConflict: "id" })
      .select();

    if (error) {
      console.error("Supabase praise_boards 저장 에러:", error);
      return { success: false, error };
    }

    if (board.theme_color) {
      await apiSaveThemeColor(board.id, board.theme_color, board);
    }

    return { success: true, data };
  } catch (e) {
    console.error("apiCreateBoard 예외:", e);
    return { success: false, error: e };
  }
}

export async function apiDeleteBoard(boardId) {
  localStorage.removeItem(`board_${boardId}`);
  localStorage.removeItem(`stickers_${boardId}`);

  if (isLocalMode) return true;

  try {
    const { error: stickersErr } = await supabase
      .from("praise_stickers")
      .delete()
      .eq("board_id", boardId);

    if (stickersErr) console.warn("스티커 삭제 경고:", stickersErr);

    const { error } = await supabase
      .from("praise_boards")
      .delete()
      .eq("id", boardId);

    if (error) {
      console.error("Supabase 보드 삭제 실패:", error);
      return false;
    }
    return true;
  } catch (e) {
    console.error("apiDeleteBoard 예외:", e);
    return false;
  }
}

export async function apiGetStickers(boardId) {
  if (isLocalMode) {
    const localData = localStorage.getItem(`stickers_${boardId}`);
    return localData ? JSON.parse(localData) : [];
  }

  try {
    const { data, error } = await supabase
      .from("praise_stickers")
      .select("*")
      .eq("board_id", boardId)
      .order("sticker_index", { ascending: true });

    if (error) {
      console.error("apiGetStickers 에러:", error);
      const localData = localStorage.getItem(`stickers_${boardId}`);
      return localData ? JSON.parse(localData) : [];
    }

    localStorage.setItem(`stickers_${boardId}`, JSON.stringify(data || []));
    return data || [];
  } catch (e) {
    console.error("apiGetStickers 예외:", e);
    const localData = localStorage.getItem(`stickers_${boardId}`);
    return localData ? JSON.parse(localData) : [];
  }
}

export async function apiAddSticker(boardId, index, memo, currentBoard) {
  const nowISO = new Date().toISOString();

  if (isLocalMode) {
    const current = await apiGetStickers(boardId);
    if (!current.some((s) => s.sticker_index === index)) {
      current.push({
        board_id: boardId,
        sticker_index: index,
        memo: memo,
        created_at: nowISO,
        updated_at: nowISO,
      });
      localStorage.setItem(`stickers_${boardId}`, JSON.stringify(current));
    }
    return true;
  }

  try {
    if (currentBoard) {
      await apiCreateBoard(currentBoard);
    }

    const { error } = await supabase.from("praise_stickers").upsert(
      {
        board_id: boardId,
        sticker_index: index,
        memo: memo,
        created_at: nowISO,
        updated_at: nowISO,
      },
      { onConflict: "board_id,sticker_index" }
    );

    if (error) {
      console.error("apiAddSticker 에러:", error);
      return false;
    }
    return true;
  } catch (e) {
    console.error("apiAddSticker 예외:", e);
    return false;
  }
}

export async function apiUpdateStickerMemo(boardId, index, memo) {
  const nowISO = new Date().toISOString();

  if (isLocalMode) {
    const current = await apiGetStickers(boardId);
    const sticker = current.find((s) => s.sticker_index === index);
    if (sticker) {
      sticker.memo = memo;
      sticker.updated_at = nowISO;
      localStorage.setItem(`stickers_${boardId}`, JSON.stringify(current));
    }
    return true;
  }

  try {
    const { error } = await supabase
      .from("praise_stickers")
      .update({ memo: memo, updated_at: nowISO })
      .match({ board_id: boardId, sticker_index: index });

    if (error) {
      console.error("apiUpdateStickerMemo 에러:", error);
      return false;
    }
    return true;
  } catch (e) {
    console.error("apiUpdateStickerMemo 예외:", e);
    return false;
  }
}

export async function apiRemoveSticker(boardId, index) {
  if (isLocalMode) {
    let current = await apiGetStickers(boardId);
    current = current.filter((s) => s.sticker_index !== index);
    localStorage.setItem(`stickers_${boardId}`, JSON.stringify(current));
    return true;
  }

  try {
    const { error } = await supabase
      .from("praise_stickers")
      .delete()
      .match({ board_id: boardId, sticker_index: index });

    if (error) {
      console.error("apiRemoveSticker 에러:", error);
      return false;
    }
    return true;
  } catch (e) {
    console.error("apiRemoveSticker 예외:", e);
    return false;
  }
}

export async function apiSaveThemeColor(boardId, hex, currentBoard) {
  if (!hex || !boardId) return false;
  hex = hex.toUpperCase();
  const memoStr = `[theme:${hex}]`;
  const nowISO = new Date().toISOString();

  localStorage.setItem(`board_theme_color_${boardId}`, hex);

  if (isLocalMode) {
    let current = await apiGetStickers(boardId);
    let themeSticker = current.find((s) => s.sticker_index === 999);
    if (themeSticker) {
      themeSticker.memo = memoStr;
      themeSticker.updated_at = nowISO;
    } else {
      current.push({
        board_id: boardId,
        sticker_index: 999,
        memo: memoStr,
        created_at: nowISO,
        updated_at: nowISO,
      });
    }
    localStorage.setItem(`stickers_${boardId}`, JSON.stringify(current));
    return true;
  }

  try {
    if (currentBoard) {
      await apiCreateBoard(currentBoard);
    }

    const { error } = await supabase.from("praise_stickers").upsert(
      {
        board_id: boardId,
        sticker_index: 999,
        memo: memoStr,
        created_at: nowISO,
        updated_at: nowISO,
      },
      { onConflict: "board_id,sticker_index" }
    );

    if (error) {
      console.error("테마 색상 저장 에러:", error);
      return false;
    }
    return true;
  } catch (e) {
    console.error("테마 색상 저장 예외:", e);
    return false;
  }
}

export async function apiGetAllBoards() {
  if (isLocalMode) {
    const boards = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("board_")) {
        try {
          const b = JSON.parse(localStorage.getItem(key));
          if (b && isMoonBoard(b)) boards.push(b);
        } catch {
          // ignore
        }
      }
    }
    return boards;
  }

  try {
    const { data, error } = await supabase.from("praise_boards").select("*");
    if (error || !data) return [];
    return data.filter((b) => isMoonBoard(b));
  } catch (e) {
    console.error("apiGetAllBoards 예외:", e);
    return [];
  }
}

export async function getNextSequentialBoardCode(baseBoardId) {
  const allBoards = await apiGetAllBoards();
  let sourceId = baseBoardId || "BON_WOOK";
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

  allBoards.forEach((b) => {
    if (b && b.id) {
      const idStr = String(b.id).trim().toUpperCase();
      if (idStr.startsWith(basePrefix)) {
        const match = idStr.match(
          new RegExp(`^${basePrefix.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}_?(\\d+)$`, "i")
        );
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

export async function apiUpdateBoardTitle(boardId, newTitle, currentBoard) {
  let board = await apiGetBoard(boardId);
  if (!board) board = currentBoard;
  if (!board) return false;

  board.title = newTitle;
  const result = await apiCreateBoard(board);
  if (result.success) {
    addRegisteredBoard(boardId, newTitle, board.reward_text);
    return true;
  }
  return false;
}
