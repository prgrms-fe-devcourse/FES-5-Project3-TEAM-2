import type { SearchResult } from "../types/map";

// Window 타입 확장
declare global {
  interface Window {
    [key: `addSchedule_${string}`]: (() => void) | undefined;
  }
}

// 핸들러 캐시
const handlerCache = new Set<string>();

export function createInfoContent(
  place: SearchResult,
  onAddSchedule: (place: SearchResult) => void
): string {
  const safeId = place.id.replace(/[^a-zA-Z0-9]/g, '');
  const btnId = `addSchedule_${safeId}_${Date.now()}` as const;
  
  // 기존 핸들러 정리 (캐시 활용)
  handlerCache.forEach(handlerId => {
    if (handlerId.startsWith(`addSchedule_${safeId}_`)) {
      delete window[handlerId as keyof Window];
      handlerCache.delete(handlerId);
    }
  });
  
  // 새 핸들러 등록
  window[btnId] = () => {
    try {
      onAddSchedule(place);
    } catch (error) {
      console.error('일정 추가 중 오류 발생:', error);
    } finally {
      delete window[btnId];
      handlerCache.delete(btnId);
    }
  };
  
  handlerCache.add(btnId);

  return `
    <div style="padding: 0 16px; max-width: 280px;">
      <h3 style="margin-bottom: 8px; font-size: 16px; font-weight: bold; color: #333;">
        ${escapeHtml(place.name)}
      </h3>
      
      <p style="margin-bottom: 8px; color: #666; font-size: 14px;">
        ${escapeHtml(place.address)}
      </p>
      
      ${place.rating ? `
        <p style="margin-bottom: 16px; color: #FFA500; font-weight: 500; font-size: 14px;">
          ⭐ ${place.rating}
        </p>
      ` : '<div style="margin-bottom: 16px;"></div>'}
      
      <button
        onclick="window['${btnId}']()"
        style="width: 100%; padding: 8px; margin-bottom: 8px; background: #F9B5D0; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px;"
      >
        일정 추가
      </button>
    </div>
  `;
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}