import type { SearchResult } from "../types/map";

export function createSearchInfoContent(
  place: SearchResult,
  onAddSchedule: (place: SearchResult) => void,
): HTMLElement {
  const container = document.createElement("div");
  container.style.padding = "0 16px";
  container.style.width = "280px";

  container.innerHTML = `
    <h3 style="margin-bottom: 8px; font-size: 16px; font-weight: bold; color: #333;">
      ${escapeHtml(place.name)}
    </h3>
    
    <p style="margin-bottom: 8px; color: #666; font-size: 14px;">
      ${escapeHtml(place.address)}
    </p>
    
    ${
      place.rating
        ? `
      <p style="margin-bottom: 16px; font-size: 14px;">
        ⭐ ${place.rating}
      </p>
    `
        : '<div style="margin-bottom: 16px;"></div>'
    }
    
    <button
      class="add-schedule-btn"
      style="width: 100%; padding: 8px; margin-bottom: 8px; background: #FF8E9E; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: 400;"
    >
      일정 추가
    </button>
  `;

  const addButton = container.querySelector(
    ".add-schedule-btn",
  ) as HTMLButtonElement;
  addButton.addEventListener("click", () => {
    onAddSchedule(place);
  });

  return container;
}

function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
