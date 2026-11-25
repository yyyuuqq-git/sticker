import React, { useState, useEffect, useCallback, useRef } from "react";
import confetti from "canvas-confetti";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import BoardSummary from "./components/BoardSummary";
import StickerGrid from "./components/StickerGrid";
import WelcomeScreen from "./components/WelcomeScreen";
import Toast from "./components/Toast";

// Modals
import PinModal from "./components/modals/PinModal";
import SettingsModal from "./components/modals/SettingsModal";
import DeleteConfirmModal from "./components/modals/DeleteConfirmModal";
import CreateBoardModal from "./components/modals/CreateBoardModal";
import MemoInputModal from "./components/modals/MemoInputModal";
import MemoViewModal from "./components/modals/MemoViewModal";
import BoardEditModal from "./components/modals/BoardEditModal";
import ColorPaletteModal from "./components/modals/ColorPaletteModal";

// Config, API & Utils
import { DEFAULT_THEME_COLOR } from "./config/constants";
import {
  isMoonBoard,
  getAppStorage,
  setAppStorage,
  getRegisteredBoards,
  addRegisteredBoard,
  removeRegisteredBoard,
} from "./config/isolation";
import {
  supabase,
  apiGetBoard,
  apiCreateBoard,
  apiDeleteBoard,
  apiGetStickers,
  apiAddSticker,
  apiRemoveSticker,
  apiUpdateStickerMemo,
  apiSaveThemeColor,
  apiGetAllBoards,
  getNextSequentialBoardCode,
} from "./services/api";
import { applyThemeColor } from "./utils/colorUtils";
import "./style.css";

export default function App() {
  // --- Core State ---
  const [loading, setLoading] = useState(true);
  const [currentBoardId, setCurrentBoardId] = useState("");
  const [currentBoard, setCurrentBoard] = useState(null);
  const [stickers, setStickers] = useState([]);
  const [registeredBoards, setRegisteredBoards] = useState([]);
  const [isEditorMode, setIsEditorMode] = useState(false);
  const [themeColor, setThemeColor] = useState(DEFAULT_THEME_COLOR);
  const [showWelcome, setShowWelcome] = useState(false);

  // --- Modals State ---
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [createBoardModalOpen, setCreateBoardModalOpen] = useState(false);
  const [boardEditModalOpen, setBoardEditModalOpen] = useState(false);
  const [editingBoardTarget, setEditingBoardTarget] = useState(null);
  const [memoInputModalOpen, setMemoInputModalOpen] = useState(false);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(null);
  const [memoViewModalOpen, setMemoViewModalOpen] = useState(false);
  const [selectedStickerData, setSelectedStickerData] = useState(null);
  const [deleteConfirmModalOpen, setDeleteConfirmModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // { type: 'sticker'|'board', data: any }
  const [colorPaletteModalOpen, setColorPaletteModalOpen] = useState(false);

  // --- Toast State ---
  const [toast, setToast] = useState({ visible: false, message: "" });
  const toastTimerRef = useRef(null);

  const showToast = useCallback((message) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ visible: true, message });
    toastTimerRef.current = setTimeout(() => {
      setToast({ visible: false, message: "" });
    }, 2500);
  }, []);

  // --- Theme Color Application ---
  const handleThemeColorChange = useCallback((hex, save = true) => {
    if (!hex) return;
    setThemeColor(hex);
    applyThemeColor(hex);
    if (save && currentBoardId) {
      localStorage.setItem(`board_theme_color_${currentBoardId}`, hex);
      apiSaveThemeColor(currentBoardId, hex, currentBoard);
    }
  }, [currentBoardId, currentBoard]);

  // --- Board Loader ---
  const loadBoard = useCallback(async (boardId) => {
    if (!isMoonBoard(boardId)) {
      console.warn("차단된 타 앱 보드:", boardId);
      return;
    }

    setLoading(true);
    setCurrentBoardId(boardId);
    setAppStorage("current_board_id", boardId);

    // 1. Fetch Board Metadata
    let board = await apiGetBoard(boardId);
    if (!board) {
      board = {
        id: boardId,
        title: "스티커판",
        goal_count: 30,
        reward_text: "소원 들어주기!",
        editor_pin: "1234",
      };
      await apiCreateBoard(board);
    }

    setCurrentBoard(board);
    setShowWelcome(false);

    // 2. Load Theme Color
    const savedColor =
      localStorage.getItem(`board_theme_color_${boardId}`) ||
      board.theme_color ||
      DEFAULT_THEME_COLOR;
    setThemeColor(savedColor);
    applyThemeColor(savedColor);

    // 3. Register Board
    const updatedBoards = addRegisteredBoard(board.id, board.title, board.reward_text);
    setRegisteredBoards(updatedBoards);

    // 4. Fetch Stickers
    const fetchedStickers = await apiGetStickers(boardId);
    setStickers(fetchedStickers);

    // Check theme metadata sticker (index 999)
    const themeMeta = fetchedStickers.find((s) => s.sticker_index === 999);
    if (themeMeta && themeMeta.memo) {
      const match = themeMeta.memo.match(/\[theme:(#[0-9A-Fa-f]{6})\]/i);
      if (match && match[1] !== savedColor) {
        setThemeColor(match[1]);
        applyThemeColor(match[1]);
        localStorage.setItem(`board_theme_color_${boardId}`, match[1]);
      }
    }

    setLoading(false);
  }, []);

  // --- Initial Mount & URL Param Processing ---
  useEffect(() => {
    // 1. Initialize role
    const savedEditor = getAppStorage("is_editor") === "true";
    setIsEditorMode(savedEditor);

    const initApp = async () => {
      // 2. Fetch server boards and sync with registered boards
      let serverBoards = await apiGetAllBoards();
      let localList = getRegisteredBoards();

      const boardMap = new Map();
      serverBoards.forEach((b) => {
        if (b && b.id && isMoonBoard(b)) {
          boardMap.set(b.id, { id: b.id, title: b.title, reward_text: b.reward_text || "" });
        }
      });
      localList.forEach((b) => {
        if (b && b.id && isMoonBoard(b)) {
          const existing = boardMap.get(b.id) || {};
          boardMap.set(b.id, { ...existing, ...b });
        }
      });

      const allValidBoards = Array.from(boardMap.values());
      setRegisteredBoards(allValidBoards);
      setAppStorage("registered_boards", JSON.stringify(allValidBoards));

      // 3. Check URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const paramId = urlParams.get("board");

      if (paramId) {
        if (isMoonBoard(paramId)) {
          loadBoard(paramId.toUpperCase());
          return;
        } else {
          // Cleanse invalid board from URL
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }

      // 4. Check localStorage active board
      let curId = getAppStorage("current_board_id");
      if (curId && isMoonBoard(curId)) {
        loadBoard(curId);
      } else if (allValidBoards.length > 0) {
        loadBoard(allValidBoards[0].id);
      } else {
        // Show Welcome screen if no boards
        setShowWelcome(true);
        setLoading(false);
      }
    };

    initApp();
  }, [loadBoard]);

  // --- Realtime Subscription & Auto Sync ---
  useEffect(() => {
    if (!supabase || !currentBoardId) return;

    const channel = supabase
      .channel(`public:praise_stickers:${currentBoardId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "praise_stickers",
          filter: `board_id=eq.${currentBoardId}`,
        },
        async (payload) => {
          const newRecord = payload.new;
          if (newRecord && newRecord.sticker_index === 999) {
            const match = (newRecord.memo || "").match(/\[theme:(#[0-9A-Fa-f]{6})\]/i);
            if (match) {
              setThemeColor(match[1]);
              applyThemeColor(match[1]);
              localStorage.setItem(`board_theme_color_${currentBoardId}`, match[1]);
            }
          } else {
            const latestStickers = await apiGetStickers(currentBoardId);
            setStickers(latestStickers);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentBoardId]);

  // --- Goal Completion Confetti Check ---
  const activeStickersCount = stickers.filter((s) => s.sticker_index !== 999).length;
  const goalCount = currentBoard ? currentBoard.goal_count || 30 : 30;
  const isGoalReached = activeStickersCount >= goalCount && goalCount > 0;
  const prevGoalReachedRef = useRef(false);

  useEffect(() => {
    if (isGoalReached && !prevGoalReachedRef.current) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
    prevGoalReachedRef.current = isGoalReached;
  }, [isGoalReached]);

  // --- Slot Click Handlers ---
  const handleSlotClick = (slotIdx, isActive, stickerData) => {
    if (isActive) {
      setSelectedSlotIndex(slotIdx);
      setSelectedStickerData(stickerData);
      setMemoViewModalOpen(true);
    } else {
      if (!isEditorMode) {
        showToast("스티커는 여자친구 모드에서만 붙일 수 있어요! 🔒");
        setPinModalOpen(true);
        return;
      }
      setSelectedSlotIndex(slotIdx);
      setMemoInputModalOpen(true);
    }
  };

  // --- Attach Sticker ---
  const handleAttachSticker = async (slotIdx, memoPayload) => {
    const success = await apiAddSticker(currentBoardId, slotIdx, memoPayload, currentBoard);
    if (success) {
      const updated = await apiGetStickers(currentBoardId);
      setStickers(updated);
      showToast("스티커가 부착되었어요! ✨");
    } else {
      showToast("스티커 부착 중 오류가 발생했습니다.");
    }
  };

  // --- Edit Sticker Memo ---
  const handleEditStickerMemo = async (slotIdx, updatedMemo) => {
    const success = await apiUpdateStickerMemo(currentBoardId, slotIdx, updatedMemo);
    if (success) {
      const updated = await apiGetStickers(currentBoardId);
      setStickers(updated);
      showToast("칭찬 메모가 수정되었어요! 💌");
    }
  };

  // --- Remove Sticker Prompt ---
  const handlePromptRemoveSticker = (slotIdx) => {
    setMemoViewModalOpen(false);
    setDeleteTarget({ type: "sticker", data: slotIdx });
    setDeleteConfirmModalOpen(true);
  };

  // --- Board Creation ---
  const handleCreateNewBoard = async (newBoardData) => {
    const baseCode = newBoardData.id || (await getNextSequentialBoardCode("BON_WOOK"));
    const finalBoard = {
      id: baseCode,
      title: newBoardData.title || "스티커판",
      goal_count: newBoardData.goal_count || 30,
      reward_text: newBoardData.reward_text || "소원 들어주기!",
      editor_pin: newBoardData.editor_pin || (currentBoard && currentBoard.editor_pin) || "1234",
      theme_color: themeColor,
    };

    await apiCreateBoard(finalBoard);
    await loadBoard(finalBoard.id);
    showToast(`새 스티커판 '${finalBoard.title}'이 생성되었어요! 🎉`);
  };

  // --- Board Deletion Prompt ---
  const handlePromptDeleteBoard = (boardToDelete) => {
    setDeleteTarget({ type: "board", data: boardToDelete });
    setDeleteConfirmModalOpen(true);
  };

  // --- Confirm Deletion ---
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === "sticker") {
      const slotIdx = deleteTarget.data;
      const success = await apiRemoveSticker(currentBoardId, slotIdx);
      if (success) {
        const updated = await apiGetStickers(currentBoardId);
        setStickers(updated);
        showToast("스티커가 제거되었어요.");
      }
    } else if (deleteTarget.type === "board") {
      const b = deleteTarget.data;
      await apiDeleteBoard(b.id);
      const { updatedList, nextBoardId } = removeRegisteredBoard(b.id, currentBoardId);
      setRegisteredBoards(updatedList);

      if (updatedList.length > 0) {
        await loadBoard(nextBoardId);
      } else {
        setShowWelcome(true);
        setCurrentBoard(null);
        setCurrentBoardId("");
      }
      showToast(`'${b.title}' 스티커판이 삭제되었습니다.`);
    }

    setDeleteConfirmModalOpen(false);
    setDeleteTarget(null);
  };

  // --- Edit Board Metadata ---
  const handleSaveBoardMetadata = async (updatedBoard) => {
    await apiCreateBoard(updatedBoard);
    setCurrentBoard(updatedBoard);
    const updatedBoards = addRegisteredBoard(
      updatedBoard.id,
      updatedBoard.title,
      updatedBoard.reward_text
    );
    setRegisteredBoards(updatedBoards);
    showToast("스티커판 정보가 수정되었어요! ✨");
  };

  // --- PIN Auth Submit ---
  const handlePinSubmit = (enteredPin) => {
    const requiredPin =
      (currentBoard && currentBoard.editor_pin) ||
      localStorage.getItem(`board_pin_${currentBoardId}`) ||
      "1234";

    if (enteredPin === requiredPin) {
      setIsEditorMode(true);
      setAppStorage("is_editor", "true");
      showToast("여자친구 모드로 전환되었어요! 💖");
      return true;
    }
    return false;
  };

  // --- Toggle Role ---
  const handleToggleRole = () => {
    if (isEditorMode) {
      setIsEditorMode(false);
      setAppStorage("is_editor", "false");
      showToast("남자친구 모드(조회 전용)로 전환되었어요.");
    } else {
      setPinModalOpen(true);
    }
  };

  return (
    <div className="app-container">
      {/* 0. Sidebar Drawer */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        boards={registeredBoards}
        currentBoardId={currentBoardId}
        onSelectBoard={loadBoard}
        onOpenCreateBoard={() => setCreateBoardModalOpen(true)}
        onEditBoard={(b) => {
          setEditingBoardTarget(b);
          setBoardEditModalOpen(true);
        }}
        onDeleteBoard={handlePromptDeleteBoard}
        isEditorMode={isEditorMode}
        onToggleRole={handleToggleRole}
        onOpenSettings={() => setSettingsModalOpen(true)}
      />

      {/* 1. Header Bar */}
      <Header
        boardTitle={currentBoard ? currentBoard.title : "스티커판"}
        onOpenSidebar={() => setSidebarOpen(true)}
        onOpenColorPalette={() => {
          if (!isEditorMode) {
            showToast("테마 색상은 여자친구 모드에서만 변경할 수 있어요! 🔒");
            setPinModalOpen(true);
            return;
          }
          setColorPaletteModalOpen(true);
        }}
      />

      {/* Loading Spinner */}
      {loading && (
        <div id="loading-spinner" className="spinner-container">
          <div className="spinner"></div>
        </div>
      )}

      {/* Welcome Screen (If no board exists) */}
      {!loading && showWelcome && (
        <WelcomeScreen onCreateBoard={handleCreateNewBoard} />
      )}

      {/* Main Board Content */}
      {!loading && !showWelcome && currentBoard && (
        <main className="app-content">
          <BoardSummary
            boardTitle={currentBoard.title}
            rewardText={currentBoard.reward_text}
            currentCount={activeStickersCount}
            goalCount={goalCount}
            isGoalReached={isGoalReached}
          />

          <StickerGrid
            targetCount={goalCount}
            stickers={stickers}
            onSlotClick={handleSlotClick}
          />
        </main>
      )}

      {/* Modals */}
      <PinModal
        isOpen={pinModalOpen}
        onClose={() => setPinModalOpen(false)}
        onSubmit={handlePinSubmit}
      />

      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        isEditorMode={isEditorMode}
        currentBoard={currentBoard}
        onSwitchBoard={(code) => {
          if (isMoonBoard(code)) {
            loadBoard(code);
          } else {
            showToast("유효한 달 스티커판 코드가 아닙니다.");
          }
        }}
        onSaveSettings={async (settings) => {
          if (currentBoard) {
            const updated = {
              ...currentBoard,
              editor_pin: settings.pin,
            };
            localStorage.setItem("global_app_title", settings.appTitle);
            localStorage.setItem("global_reader_role_name", settings.readerName);
            localStorage.setItem("global_editor_role_name", settings.editorName);
            await apiCreateBoard(updated);
            setCurrentBoard(updated);
            showToast("설정이 저장되었습니다.");
          }
        }}
      />

      <CreateBoardModal
        isOpen={createBoardModalOpen}
        onClose={() => setCreateBoardModalOpen(false)}
        onCreate={handleCreateNewBoard}
      />

      <BoardEditModal
        isOpen={boardEditModalOpen}
        board={editingBoardTarget || currentBoard}
        isEditorMode={isEditorMode}
        onClose={() => {
          setBoardEditModalOpen(false);
          setEditingBoardTarget(null);
        }}
        onSave={handleSaveBoardMetadata}
      />

      <MemoInputModal
        isOpen={memoInputModalOpen}
        slotIndex={selectedSlotIndex}
        onClose={() => {
          setMemoInputModalOpen(false);
          setSelectedSlotIndex(null);
        }}
        onSubmit={handleAttachSticker}
      />

      <MemoViewModal
        isOpen={memoViewModalOpen}
        slotIndex={selectedSlotIndex}
        stickerData={selectedStickerData}
        isEditorMode={isEditorMode}
        onClose={() => {
          setMemoViewModalOpen(false);
          setSelectedSlotIndex(null);
          setSelectedStickerData(null);
        }}
        onEditMemo={handleEditStickerMemo}
        onRemoveSticker={handlePromptRemoveSticker}
      />

      <DeleteConfirmModal
        isOpen={deleteConfirmModalOpen}
        title={deleteTarget?.type === "sticker" ? "스티커 제거" : "스티커판 삭제"}
        message={
          deleteTarget?.type === "sticker"
            ? "스티커를 떼겠습니까?"
            : `'${deleteTarget?.data?.title || "스티커판"}'을(를) 정말 삭제하시겠습니까?`
        }
        onClose={() => {
          setDeleteConfirmModalOpen(false);
          setDeleteTarget(null);
        }}
        onConfirm={handleConfirmDelete}
      />

      <ColorPaletteModal
        isOpen={colorPaletteModalOpen}
        currentColor={themeColor}
        onClose={() => setColorPaletteModalOpen(false)}
        onApply={(hex) => handleThemeColorChange(hex, true)}
      />

      {/* Toast Feedback */}
      <Toast message={toast.message} visible={toast.visible} />
    </div>
  );
}
