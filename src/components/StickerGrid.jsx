import React from "react";
import { PRAISE_STICKERS } from "../config/constants";
import { parseStickerMemo } from "../services/api";

export default function StickerGrid({
  targetCount = 30,
  stickers = [],
  onSlotClick,
}) {
  const stickerMap = React.useMemo(() => {
    const map = new Map();
    stickers.forEach((s) => {
      if (s.sticker_index !== 999) {
        map.set(s.sticker_index, s);
      }
    });
    return map;
  }, [stickers]);

  return (
    <div id="sticker-grid" className="sticker-grid">
      {Array.from({ length: targetCount }, (_, i) => {
        const stickerData = stickerMap.get(i);
        const isActive = !!stickerData;

        let stickerItem = null;
        if (isActive) {
          const parsed = parseStickerMemo(stickerData.memo);
          const type =
            parsed.type !== null && parsed.type >= 0
              ? parsed.type % PRAISE_STICKERS.length
              : i % PRAISE_STICKERS.length;
          stickerItem = PRAISE_STICKERS[type] || PRAISE_STICKERS[0];
        }

        return (
          <div
            key={i}
            className={`grid-slot ${isActive ? "active" : ""}`}
            role="button"
            tabIndex={0}
            aria-label={`${i + 1}번째 칸, ${isActive ? "스티커 붙음" : "비어 있음"}`}
            onClick={() => onSlotClick(i, isActive, stickerData)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSlotClick(i, isActive, stickerData);
              }
            }}
          >
            {isActive && stickerItem && (
              <div className="sticker-img-container active">
                <img
                  src={stickerItem.src}
                  alt={stickerItem.name}
                  className="praise-sticker-img"
                  draggable="false"
                />
              </div>
            )}
            <span className="slot-number">{i + 1}</span>
          </div>
        );
      })}
    </div>
  );
}
