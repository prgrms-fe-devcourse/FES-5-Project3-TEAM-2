interface ClickedLocation {
  lat: number;
  lng: number;
}

export function createMapClickInfoContent(
  location: ClickedLocation,
  onAddSchedule: (location: ClickedLocation) => void,
): HTMLElement {
  const container = document.createElement("div");
  container.style.padding = "0 16px";
  container.style.width = "280px";

  container.innerHTML = `
    <div style="text-align: center;">
      <p style="margin-bottom: 16px; font-size: 16px; font-weight:400;">
        이 위치에 일정을 추가하시겠습니까?
      </p>
      
      <button
        class="add-schedule-btn"
        style="width: 100%; padding: 8px; background: #FF8E9E; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: 400;"
      >
        일정 추가
      </button>
    </div>
  `;

  const addButton = container.querySelector(
    ".add-schedule-btn",
  ) as HTMLButtonElement;

  addButton.addEventListener("click", async () => {
    // 로딩 상태
    addButton.disabled = true;
    addButton.textContent = "주소 확인 중";
    addButton.style.background = "#BFBFBF";
    addButton.style.cursor = "not-allowed";

    await onAddSchedule(location);
  });

  return container;
}
