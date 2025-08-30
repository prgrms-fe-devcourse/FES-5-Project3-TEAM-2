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
  const group = useGroupStore((state) => state.group); 

  const navigate = useNavigate();

  useEffect(() => {
    if (!group) return;
    
    const myProfile = usePresenceStore.getState().myProfile;
    const editingItems = usePlanStore.getState().editingItemIds;
    
    if (myProfile) {
      const myEditingItems = editingItems.filter(item => item.userId === myProfile.id);
      myEditingItems.forEach(item => {
        usePlanStore.getState().removeEditingItem(item.itemId);
      });
    }

    const myUserId = myProfile?.id ?? "guest";

    const channel = supabase.channel(group.id, {
      config: {
        presence: { key: myUserId },
      },
    });

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
        channel.track({
          user_id: myUserId,
          online_at: new Date().toISOString(),
        });
      }
    });

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
        const myEditingItems = editingItems.filter(item => item.userId === myProfile.id);
        myEditingItems.forEach(item => {
          usePlanStore.getState().removeEditingItem(item.itemId);
        });
      }
      

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