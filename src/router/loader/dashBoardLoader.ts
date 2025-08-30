// loaders/dashboardLoader.ts
import { type LoaderFunctionArgs } from "react-router-dom"
import { loadGroupData, type Group } from "@/pages/DashBoard/api/loadGroupData"
import { loadPlanItems, type PlanItem } from "@/pages/DashBoard/api/loadPlanItem"
import { useGroupStore } from "@/pages/DashBoard/store/groupStore"
import { generateTripDays } from "@/pages/DashBoard/utils/generateTripDays"
import { usePlanStore } from "@/pages/DashBoard/store/planStore"
import { getMyUserId } from "@/pages/DashBoard/api/getMyUserId"
import { usePresenceStore } from "@/pages/DashBoard/store/presenceStore"


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

  const myId = await getMyUserId()
  usePresenceStore.getState().setMyUserId(myId)

  return null;
}
