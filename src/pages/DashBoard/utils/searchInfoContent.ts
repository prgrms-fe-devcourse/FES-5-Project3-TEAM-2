import type { SearchResult } from "../types/map";
import exportLinkIcon from "@/assets/icons/external-link.png";

export function createSearchInfoContent(
  place: SearchResult,
  onAddSchedule: (place: SearchResult) => void,
): HTMLElement {
  const container = document.createElement("div");
  container.style.padding = "0 16px";
  container.style.maxWidth = "280px";

  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
      <h3 style="margin: 0; font-size: 16px; font-weight: bold; color: #333; flex: 1; padding-right: 8px;">
        ${escapeHtml(place.name)}
      </h3>
      ${createGoogleSearchButton()}
    </div>
    
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

  // 일정 추가 버튼
  const addButton = container.querySelector(
    ".add-schedule-btn",
  ) as HTMLButtonElement;
  addButton.addEventListener("click", () => {
    onAddSchedule(place);
  });

  // 구글 검색 버튼
  setupGoogleSearchButton(container, place);

  return container;
}

function createGoogleSearchButton(): string {
  return `
    <button 
      class="google-search-btn" 
      style="
        width: 20px; 
        height: 20px; 
        display: flex; 
        align-items: center; 
        justify-content: center; 
        background: none; 
        border: none; 
        cursor: pointer; 
        padding: 0;
        flex-shrink: 0;
      "
      title="구글에서 검색"
    >
      <img src="${exportLinkIcon}" alt="외부 링크" style="width: 20px; height: 20px; opacity: 0.6;" />
    </button>
  `;
}

function setupGoogleSearchButton(
  container: HTMLElement,
  place: SearchResult,
): void {
  const googleSearchButton = container.querySelector(
    ".google-search-btn",
  ) as HTMLButtonElement;

  if (googleSearchButton) {
    googleSearchButton.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      const query = `${place.name}`;
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
      window.open(searchUrl, "_blank");
    });

    // 호버 효과
    const img = googleSearchButton.querySelector("img");
    googleSearchButton.addEventListener("mouseenter", () => {
      if (img) img.style.opacity = "1";
    });

    googleSearchButton.addEventListener("mouseleave", () => {
      if (img) img.style.opacity = "0.6";
    });
  }
}

function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
