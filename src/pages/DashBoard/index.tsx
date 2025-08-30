import { useEffect } from "react";
import Map from "@/pages/DashBoard/components/Map";
import Schedule from "@/pages/DashBoard/components/Schedule";
import { supabase } from "@/lib/supabaseClient";
import { useGroupStore } from "./store/groupStore";
import { usePlanStore } from "./store/planStore";
import { useNavigate } from "react-router";
import type { Group } from "./api/loadGroupData";
import type { PlanItem } from "./api/loadPlanItem";
import type { RealtimePresenceState } from "@supabase/supabase-js";
import { usePresenceStore } from "./store/presenceStore";

function DashBoard() {
  const group = useGroupStore((state) => state.group); // 참가하고자 하는 그룹을 가져옴.
  const navigate = useNavigate();

  useEffect(() => {
    if (!group) return;

    const channel = supabase.channel(group.id, {
      config: {
        presence: { key: usePresenceStore.getState().myUserId ?? "guest" },
      },
    });

    channel.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "groups",
      },
      (payload) => {
        switch (payload.eventType) {
          case "UPDATE":
            useGroupStore.getState().setGroup(payload.new as Group);
            break;
          case "DELETE":
            navigate("/", { replace: true });
            break;
        }
      },
    );

    channel.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "planitems",
      },
      (payload) => {
        console.log("🔔 DB 변경 감지:", payload);
        switch (payload.eventType) {
          case "INSERT":
            usePlanStore.getState().addPlanItem(payload.new as PlanItem);
            break;
          case "UPDATE":
            usePlanStore
              .getState()
              .updatePlanItem(payload.new.id, payload.new as PlanItem);
            break;
          case "DELETE":
            usePlanStore.getState().removePlanItem(payload.old.id);
            break;
        }
      },
    );

    channel.on("presence", { event: "sync" }, () => {
      const state = channel.presenceState() as RealtimePresenceState;
      const onlineIds = Object.keys(state);
      usePresenceStore.getState().setOnlineUserIds(onlineIds);
    });

    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        const myId = usePresenceStore.getState().myUserId;
        channel.track({
          user_id: myId ?? "guest",
          online_at: new Date().toISOString(),
        });
      }
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [group, navigate]);

  return (
    <div className="bg-[#FAFAFA] w-full h-full border-2 border-black flex flex-row">
      <Schedule />
      <Map />
    </div>
  );
}
export default DashBoard;
