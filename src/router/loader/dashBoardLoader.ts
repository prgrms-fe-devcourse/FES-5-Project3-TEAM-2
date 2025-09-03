// loaders/dashboardLoader.ts
import { type LoaderFunctionArgs } from "react-router-dom"
import { loadGroupData, type Group } from "@/pages/DashBoard/api/loadGroupData"
import { loadPlanItems, type PlanItem } from "@/pages/DashBoard/api/loadPlanItem"
import { useGroupStore } from "@/pages/DashBoard/store/groupStore"
import { generateTripDays } from "@/pages/DashBoard/utils/generateTripDays"
import { usePlanStore } from "@/pages/DashBoard/store/planStore"
import { getMyProfile } from "@/pages/DashBoard/api/getMyProfile" 
import { usePresenceStore } from "@/pages/DashBoard/store/presenceStore"
import { supabase } from "@/lib/supabaseClient"

export type DashboardLoaderData = {
  groupData: Group
  planItems: PlanItem[] | null
}

export async function dashboardLoader(
  { params }: LoaderFunctionArgs
): Promise<DashboardLoaderData | null> {
  const groupId = params.groupId
  if (!groupId) return null

  const groupData = await loadGroupData(groupId)
  if (!groupData) return null

  // 전체 일정 데이터 로드
  const allPlanItems = await loadPlanItems(groupId)
  
  // 여행 날짜 생성
  const tripDays = generateTripDays(groupData.start_day, groupData.end_day)

  // 스토어 초기화
  useGroupStore.getState().setGroup(groupData)
  usePlanStore.getState().setTripDays(tripDays)
  usePlanStore.getState().setSelectedDay(groupData.start_day)
  usePlanStore.getState().setAllPlanItems(allPlanItems || [])

  // DB의 editing 컬럼을 사용해 편집 목록 덮어쓰기
  if (allPlanItems && allPlanItems.length > 0) {
    const editingPairs = allPlanItems
      .filter((p) => p.editing !== null)
      .map((p) => ({ itemId: p.id, userId: p.editing as string }));

    if (editingPairs.length > 0) {
      const presenceMap = usePresenceStore.getState().onlineUsersById;
      const uniqueUserIds = Array.from(new Set(editingPairs.map((e) => e.userId)));

      // presence에 이름이 없는 사용자만 프로필에서 조회
      const missingIds = uniqueUserIds.filter((uid) => !presenceMap[uid] || presenceMap[uid].trim() === "");
      let profileNameMap: Record<string, string> = {};
      if (missingIds.length > 0) {
        const { data } = await supabase
          .from("profile")
          .select("id, name")
          .in("id", missingIds);
        if (data) {
          for (const row of data as Array<{ id: string; name: string }>) {
            profileNameMap[row.id] = row.name;
          }
        }
      }

      const resolved = editingPairs.map(({ itemId, userId }) => {
        const userName = presenceMap[userId] || profileNameMap[userId] || "";
        return { itemId, userId, userName };
      });

      usePlanStore.getState().setEditingItems(resolved);
    } else {
      usePlanStore.getState().setEditingItems([]);
    }
  } else {
    usePlanStore.getState().setEditingItems([]);
  }

  const myProfile = await getMyProfile()
  usePresenceStore.getState().setMyProfile(myProfile)

  return null
}
