interface Schedule {
  id: string;
  title: string;
  address: string | null;
  day: string;
  group_id: string;
  latitude: number | null;
  longitude: number | null;
}

export function createScheduleInfoContent(schedule: Schedule): string {
  return `
    <div style="padding: 0 16px; max-width: 280px;">
      <h3 style="margin-bottom: 8px; font-size: 16px; font-weight: bold; color: #333;">
        ${escapeHtml(schedule.title)}
      </h3>
      
      ${
        schedule.address
          ? `
        <p style="margin-bottom: 8px; color: #666; font-size: 14px;">
          📍 ${escapeHtml(schedule.address)}
        </p>
      `
          : ""
      }

      <p style="margin-bottom: 16px; color: #888; font-size: 14px;">
        📅 ${schedule.day}
      </p>
    </div>
  `;
}

function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
