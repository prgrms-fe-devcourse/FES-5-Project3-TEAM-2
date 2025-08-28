import { supabase } from "@/lib/supabaseClient";

export interface PlanItem {
  id: string;
  group_id: string;
  title: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  sort_order: string;   // fractional_index
  duration: number;
  day: string;          // 'YYYY-MM-DD' format
  jitter: string;       // 화면에는 안 쓰이고 정렬/충돌 방지용
}

export async function loadPlanItems(groupId: string): Promise<PlanItem[] | null> {
  const { data, error } = await supabase
    .from("planitems")
    .select("*")
    .eq("group_id", groupId)
    .order("day")           // 1순위: 날짜
    .order("sort_order")    // 2순위: fractional_index
    .order("jitter");       // 3순위: fractional_index 같을 때 jitter

  if (error) {
    console.error("Error loading plan items:", error);
    return null;
  }

  return data as PlanItem[];
}
