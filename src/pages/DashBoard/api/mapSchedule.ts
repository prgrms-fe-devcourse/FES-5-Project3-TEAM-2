import { supabase } from "@/lib/supabaseClient";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

export interface Schedule {
  id: string;
  title: string;
  address: string | null;
  day: string;
  group_id: string;
  latitude: number | null;
  longitude: number | null;
}

export const scheduleApi = {
  // 마커에 보여줄 수 있는 특정 그룹 + 날짜 일정 조회 (초기 데이터 로드)
  async getSchedules(groupId: string): Promise<Schedule[]> {
    const { data, error } = await supabase
      .from("planitems")
      .select("id, title, address, day, group_id, latitude, longitude")
      .eq("group_id", groupId)
      .not("latitude", "is", null)
      .not("longitude", "is", null);
    if (error) throw error;
    return data || [];
  },

  // Realtime 구독
  createSubscription(
    groupId: string,
    onScheduleChange: (
      payload: RealtimePostgresChangesPayload<Schedule>,
    ) => void,
  ) {
    const channel = supabase
      .channel(`planitems_${groupId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "planitems",
          filter: `group_id=eq.${groupId}`,
        },
        (payload) => {
          // UPDATE 이벤트일 때 title 변경 여부만 확인
          if (payload.eventType === "UPDATE") {
            const oldTitle = (payload.old as { title?: string })?.title;
            const newTitle = (payload.new as { title?: string })?.title;

            if (oldTitle !== newTitle) {
              onScheduleChange(
                payload as RealtimePostgresChangesPayload<Schedule>,
              );
            }
            return;
          }

          // UPDATE가 아닌 이벤트(INSERT, DELETE) 처리
          onScheduleChange(payload as RealtimePostgresChangesPayload<Schedule>);
        },
      )
      .subscribe();
    return channel;
  },

  // 구독 해제
  removeSubscription(channel: ReturnType<typeof supabase.channel>) {
    return supabase.removeChannel(channel);
  },
};
