import { supabase } from "@/lib/supabaseClient";
import { generateKeyBetween } from "fractional-indexing";
import { createJitter } from "../utils/createJitter";
import type { Database } from "@/types/supabase";

export interface PlanItemInsert {
  group_id: string;
  title: string;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  duration?: number;
  day: string; // 'YYYY-MM-DD' format
}

export type PlanItem = Database["public"]["Tables"]["planitems"]["Row"];

export async function insertPlanItem(
  item: PlanItemInsert,
  cachedItems?: PlanItem[]
): Promise<PlanItem> {
  console.log("📌 insertPlanItem 실행:", item);
  try {
    let lastSortOrder: string | null = null;

    // 캐시 활용
    if (cachedItems && cachedItems.length > 0) {
      lastSortOrder = cachedItems[cachedItems.length - 1].sort_order;
    } else {
      // 캐시에 없으면 DB 조회
      console.log("캐시된 데이터가 없으므로 DB에서 마지막 인덱스를 가져오겠습니다.");
      const { data: lastItem, error: queryError } = await supabase
        .from("planitems")
        .select("sort_order")
        .eq("group_id", item.group_id)
        .eq("day", item.day)
        .order("sort_order", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (queryError) {
        throw new Error(`Failed to query last item: ${queryError.message}`);
      }

      lastSortOrder = lastItem?.sort_order || null;
    }

    const newSortOrder = generateKeyBetween(lastSortOrder, null);
    const newJitter = createJitter();

    const newItem = {
      ...item,
      sort_order: newSortOrder,
      jitter: newJitter,
      duration: item.duration || 120, // 기본값 2시간
    };

    // DB에 삽입
    const { data, error } = await supabase
      .from("planitems")
      .insert(newItem)
      .select()
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to insert plan item: ${error.message}`);
    }

    if (!data) {
      throw new Error("Insert succeeded but no data returned");
    }

    console.log("✅ 일정 추가가 정상적으로 수행되었습니다.");
    return data;
  } catch (error) {
    console.error("Error inserting plan item:", error);
    throw error;
  }
}
