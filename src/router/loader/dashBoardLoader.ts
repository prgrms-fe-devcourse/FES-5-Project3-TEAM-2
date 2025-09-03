// loaders/dashboardLoader.ts
import { type LoaderFunctionArgs } from "react-router-dom";
import { loadGroupData, type Group } from "@/pages/DashBoard/api/loadGroupData";
import { loadPlanItems, type PlanItem } from "@/pages/DashBoard/api/loadPlanItem";
import { useGroupStore } from "@/pages/DashBoard/store/groupStore";
import { generateTripDays } from "@/pages/DashBoard/utils/generateTripDays";
import { usePlanStore } from "@/pages/DashBoard/store/planStore";
import { getMyProfile } from "@/pages/DashBoard/api/getMyProfile";
import { usePresenceStore } from "@/pages/DashBoard/store/presenceStore";
import { supabase } from "@/lib/supabaseClient";

export type DashboardLoaderData = {
  groupData: Group;
  planItems: PlanItem[] | null;
};

// ──────────────────────────────────────────────
// Helper: DB에서 사용자 이름 가져오기
async function fetchProfileNames(userIds: string[]): Promise<Record<string, string>> {
  if (userIds.length === 0) return {};

  const { data } = await supabase
    .from("profile")
    .select("id, name")
    .in("id", userIds);

  const result: Record<string, string> = {};
  if (data) {
    for (const row of data as Array<{ id: string; name: string }>) {
      result[row.id] = row.name;
    }
  }
  return result;
}

// Helper: planItems 기반으로 편집 목록 세팅
async function syncEditingItems(allPlanItems: PlanItem[]) {
  const editingPairs = allPlanItems
    .filter((p) => p.editing !== null)
    .map((p) => ({ itemId: p.id, userId: p.editing as string }));

  if (editingPairs.length === 0) {
    usePlanStore.getState().setEditingItems([]);
    return;
  }

  const presenceMap = usePresenceStore.getState().onlineUsersById;
  const uniqueUserIds = Array.from(new Set(editingPairs.map((e) => e.userId)));

  // presence에 없는 유저만 DB에서 조회
  const missingIds = uniqueUserIds.filter(
    (uid) => !presenceMap[uid] || presenceMap[uid].trim() === ""
  );
  const profileNameMap = await fetchProfileNames(missingIds);

  const resolved = editingPairs.map(({ itemId, userId }) => ({
    itemId,
    userId,
    userName: presenceMap[userId] || profileNameMap[userId] || "",
  }));

  usePlanStore.getState().setEditingItems(resolved);
}

// ──────────────────────────────────────────────
// Main Loader
export async function dashboardLoader(
  { params }: LoaderFunctionArgs
): Promise<DashboardLoaderData | null> {
  const groupId = params.groupId;
  if (!groupId) return null;

  const groupData = await loadGroupData(groupId);
  if (!groupData) return null;

  // 일정 & 날짜 로드
  const allPlanItems = await loadPlanItems(groupId);
  const tripDays = generateTripDays(groupData.start_day, groupData.end_day);

  // 스토어 초기화
  useGroupStore.getState().setGroup(groupData);
  usePlanStore.getState().setTripDays(tripDays);
  usePlanStore.getState().setSelectedDay(groupData.start_day);
  usePlanStore.getState().setAllPlanItems(allPlanItems || []);

  // 편집 목록 동기화
  if (allPlanItems) {
    await syncEditingItems(allPlanItems);
  } else {
    usePlanStore.getState().setEditingItems([]);
  }

  // 내 프로필 동기화
  const myProfile = await getMyProfile();
  usePresenceStore.getState().setMyProfile(myProfile);

  return null;
}
