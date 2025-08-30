import { supabase } from "@/lib/supabaseClient";
import type { Database } from "@/types/supabase";

export type PlanItem = Database["public"]["Tables"]["planitems"]["Row"];

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
