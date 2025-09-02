import { useEffect } from "react";
import Map from "@/pages/DashBoard/components/Map";
import Schedule from "@/pages/DashBoard/components/Schedule";
import { supabase } from "@/lib/supabaseClient";
import { useGroupStore } from "./store/groupStore";
import { usePlanStore } from "./store/planStore";
import { useNavigate } from "react-router";
import type { Group } from "./api/loadGroupData";
import type { PlanItem } from "./api/loadPlanItem";
import { usePresenceStore } from "./store/presenceStore";
import { generateTripDays } from "./utils/generateTripDays";

function DashBoard() {
  const group = useGroupStore((state) => state.group);
  const navigate = useNavigate();

  useEffect(() => {
    if (!group) return;

    const myProfile = usePresenceStore.getState().myProfile;
    const editingItems = usePlanStore.getState().editingItemIds;

    if (myProfile) {
      const myEditingItems = editingItems.filter(
        (item) => item.userId === myProfile.id,
      );
      myEditingItems.forEach((item) => {
        usePlanStore.getState().removeEditingItem(item.itemId);
      });
    }

    const channel = supabase.channel(group.id);

    channel.on("broadcast", { event: "edit-start" }, ({ payload }) => {
      const { itemId, userId, userName } = payload;
      usePlanStore.getState().addEditingItemRemote(itemId, userId, userName);
    });

    channel.on("broadcast", { event: "edit-end" }, ({ payload }) => {
      const { itemId, userId } = payload;
      usePlanStore.getState().removeEditingItemRemote(itemId, userId);
    });

    channel.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "groups",
        filter: `id=eq.${group.id}`,
      },
      (payload) => {
        switch (payload.eventType) {
          case "UPDATE": {
            const updatedGroup = payload.new as Group;
            useGroupStore.getState().setGroup(updatedGroup);

            const newTripDays = generateTripDays(
              updatedGroup.start_day,
              updatedGroup.end_day,
            );
            usePlanStore.getState().setTripDays(newTripDays);
            break;
          }
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
        filter: `group_id=eq.${group.id}`,
      },
      (payload) => {
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

    channel.subscribe();

    return () => {
      const myProfile = usePresenceStore.getState().myProfile;
      const editingItems = usePlanStore.getState().editingItemIds;

      if (myProfile && editingItems.length > 0) {
        editingItems.forEach((item) => {
          if (item.userId === myProfile.id) {
            channel.send({
              type: "broadcast",
              event: "edit-end",
              payload: { itemId: item.itemId, userId: myProfile.id },
            });
          }
        });
      }

      if (myProfile) {
        const myEditingItems = editingItems.filter(
          (item) => item.userId === myProfile.id,
        );
        myEditingItems.forEach((item) => {
          usePlanStore.getState().removeEditingItem(item.itemId);
        });
      }

      supabase.removeChannel(channel);
    };
  }, [group, navigate]);

  return (
    <div className="h-full flex flex-row min-w-[1200px]">
      <Schedule />
      <Map />
    </div>
  );
}

export default DashBoard;
