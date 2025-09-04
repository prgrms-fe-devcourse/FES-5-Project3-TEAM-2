import { useEffect } from "react";
import MapContainer from "./components/MapContainer";
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
            // 우선 로컬 아이템 내용 갱신
            usePlanStore
              .getState()
              .updatePlanItem(payload.new.id, payload.new as PlanItem);

            // editing 필드의 변화 감지하여 에딧목록 동기화
            try {
              const oldEditing =
                (payload.old as Partial<PlanItem> | null)?.editing ?? null;
              const newEditing =
                (payload.new as Partial<PlanItem> | null)?.editing ?? null;

              if (oldEditing !== newEditing) {
                // 이전 편집자 제거
                if (oldEditing) {
                  usePlanStore
                    .getState()
                    .removeEditingItemRemote(payload.new.id, oldEditing);
                }

                // 신규 편집자 추가
                if (newEditing) {
                  const presenceMap =
                    usePresenceStore.getState().onlineUsersById;
                  const userName = presenceMap[newEditing] || "";
                  if (!userName) {
                    // fallback: profile에서 이름 조회
                    void (async () => {
                      try {
                        const { data } = await supabase
                          .from("profile")
                          .select("id, name")
                          .eq("id", newEditing)
                          .maybeSingle();
                        const resolvedName = data?.name ?? "";
                        usePlanStore
                          .getState()
                          .addEditingItemRemote(
                            payload.new.id,
                            newEditing,
                            resolvedName,
                          );
                      } catch {
                        usePlanStore
                          .getState()
                          .addEditingItemRemote(payload.new.id, newEditing, "");
                      }
                    })();
                  } else {
                    usePlanStore
                      .getState()
                      .addEditingItemRemote(
                        payload.new.id,
                        newEditing,
                        userName,
                      );
                  }
                }
              }
            } catch (e) {
              console.error("editing 동기화 처리 중 오류:", e);
            }
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

        // DB에도 내 editing 잠금을 일괄 해제
        void (async () => {
          try {
            await supabase
              .from("planitems")
              .update({ editing: null })
              .eq("group_id", group.id)
              .eq("editing", myProfile.id);
          } catch (e) {
            console.error("언마운트 시 editing 해제 실패:", e);
          }
        })();
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
    <div className="h-full flex flex-row min-w-[1000px]">
      <Schedule />
      <MapContainer />
    </div>
  );
}

export default DashBoard;
