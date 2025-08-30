import { useEffect } from "react";
import Map from "@/pages/DashBoard/components/Map";
import Schedule from "@/pages/DashBoard/components/Schedule";
import { supabase } from "@/lib/supabaseClient";
import { useGroupStore } from "./store/groupStore";
import { usePlanStore } from "./store/planStore";
import { useNavigate } from "react-router";
import type { Group } from "./api/loadGroupData";
import type { PlanItem } from "./api/loadPlanItem";

function DashBoard() {
  const group = useGroupStore((state) => state.group); // 참가하고자 하는 그룹을 가져옴.
  const navigate = useNavigate();

  useEffect(() => {
    if (!group) return;
    console.log(group);
    const channel = supabase
      .channel(group.id)
      .on(
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
            case "INSERT":
            default:
              return null;
          }
        },
      )
      .on(
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
      )
      .subscribe((status) => {
        console.log("채널 상태:", status); // SUBSCRIBED 되어야 정상
      });

    return () => {
      // 페이지 언마운트 되면 클린업.
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
