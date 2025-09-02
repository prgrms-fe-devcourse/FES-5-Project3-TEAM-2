interface Schedule {
  id: string;
  title: string;
  address: string | null;
  day: string;
  group_id: string;
  latitude: number | null;
  longitude: number | null;
}

export function createScheduleInfoContent(
  schedules: Schedule | Schedule[],
  onAddSchedule?: (location: {
    lat: number;
    lng: number;
    address: string;
  }) => void,
): HTMLElement {
  const container = document.createElement("div");
  container.style.padding = "0 16px";
  container.style.width = "280px";

  const scheduleArray = Array.isArray(schedules) ? schedules : [schedules];
  const firstSchedule = scheduleArray[0];

  // 공통 스타일 정의
  const buttonStyle =
    "width: 100%; padding: 8px; margin-bottom: 8px; background: #FF8E9E; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: 400;";

  if (scheduleArray.length === 1) {
    // 단일 일정
    container.innerHTML = createSingleScheduleHTML(firstSchedule, buttonStyle);
  } else {
    // 여러 일정
    container.innerHTML = createMultipleSchedulesHTML(
      scheduleArray,
      buttonStyle,
    );
  }

  // 버튼 이벤트 리스너
  setupAddButton(container, firstSchedule, onAddSchedule);

  return container;
}

function createSingleScheduleHTML(
  schedule: Schedule,
  buttonStyle: string,
): string {
  return `
    <h3 style="margin-bottom: 8px; font-size: 16px; font-weight: bold; color: #333;">
      일정
    </h3>
    
    ${
      schedule.address
        ? `<div style="color: #666; font-size: 12px; margin-bottom: 12px;">
             📍 ${escapeHtml(schedule.address)}
           </div>`
        : ""
    }
    
    <div style="margin-bottom: 16px;">
      <div style="background-color: #F0F0F0; padding: 12px; border-radius: 8px;">
        <div style="font-weight: 600; color: #333; margin-bottom: 4px;">
          ${escapeHtml(schedule.title)}
        </div>
        <div style="color: #888; font-size: 12px;">
          📅 ${schedule.day}
        </div>
      </div>
    </div>
    
    <button class="add-schedule-btn" style="${buttonStyle}">
      일정 추가
    </button>
  `;
}

function createMultipleSchedulesHTML(
  schedules: Schedule[],
  buttonStyle: string,
): string {
  const commonAddress = schedules.find((s) => s.address)?.address;

  const scheduleListHTML = schedules
    .map(
      (schedule) => `
      <div style="background-color: #F0F0F0; padding: 12px; border-radius: 8px; margin-bottom: 8px;">
        <div style="font-weight: 600; color: #333; margin-bottom: 4px;">
          ${escapeHtml(schedule.title)}
        </div>
        <div style="color: #888; font-size: 12px;">
          📅 ${schedule.day}
        </div>
      </div>
    `,
    )
    .join("");

  return `
    <h3 style="margin-bottom: 8px; font-size: 16px; font-weight: bold; color: #333;">
      일정 (${schedules.length}개)
    </h3>
    
    ${
      commonAddress
        ? `<div style="color: #666; font-size: 12px; margin-bottom: 12px;">
           📍 ${escapeHtml(commonAddress)}
         </div>`
        : ""
    }
    
    <div style="max-height: 200px; overflow-y: auto; margin-bottom: 16px;">
      ${scheduleListHTML}
    </div>
    
    <button class="add-schedule-btn" style="${buttonStyle}">
      일정 추가
    </button>
  `;
}

function setupAddButton(
  container: HTMLElement,
  firstSchedule: Schedule,
  onAddSchedule?: (location: {
    lat: number;
    lng: number;
    address: string;
  }) => void,
): void {
  const addButton = container.querySelector(
    ".add-schedule-btn",
  ) as HTMLButtonElement;

  if (
    addButton &&
    onAddSchedule &&
    firstSchedule.latitude &&
    firstSchedule.longitude
  ) {
    addButton.addEventListener("click", () => {
      onAddSchedule({
        lat: firstSchedule.latitude!,
        lng: firstSchedule.longitude!,
        address: firstSchedule.address || "주소 없음",
      });
    });
  }
}

function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
