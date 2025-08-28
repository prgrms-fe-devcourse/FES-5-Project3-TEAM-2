interface ClickedLocation {
  lat: number;
  lng: number;
  address: string;
}

export function createMapClickInfoContent(
  location: ClickedLocation,
  onAddSchedule: (location: ClickedLocation) => void,
): HTMLElement {
  const container = document.createElement("div");
  container.style.padding = "0 16px";
  container.style.maxWidth = "280px";

  container.innerHTML = `
    <h3 style="margin-bottom: 8px; font-size: 16px; font-weight: bold; color: #333;">
      ${escapeHtml(location.address)}
    </h3>
    
    <button
      class="add-schedule-btn"
      style="width: 100%; padding: 8px; margin-bottom: 8px; background: #F9B5D0; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px;"
    >
      일정 추가
    </button>
  `;

  const addButton = container.querySelector(
    ".add-schedule-btn",
  ) as HTMLButtonElement;
  addButton.addEventListener("click", () => {
    onAddSchedule(location);
  });

  return container;
}

function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
