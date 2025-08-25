import { supabase } from "@/lib/supabaseClient";
import { generateKeyBetween } from "fractional-indexing";
import { createJitter } from "../utils/createJitter";

export interface PlanItemInsert {
  group_id: string;
  title: string;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  duration?: number;
  day: string; // 'YYYY-MM-DD' format
}

export interface PlanItem {
  id: string;
  group_id: string;
  title: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  sort_order: string;
  duration: number;
  day: string;
}

export async function insertPlanItem(
  item: PlanItemInsert, 
  cachedItems?: PlanItem[] // 이미 특정 day로 필터링되고 정렬된 리스트
): Promise<PlanItem> {
  try {
    let lastSortOrder: string | null = null;

    // 캐시 활용 
    if (cachedItems && cachedItems.length > 0) {
      lastSortOrder = cachedItems[cachedItems.length - 1].sort_order;
    } else {
      // 캐시에 없으면 DB 조회
      console.log('캐시된 데이터가 없으므로 DB에서 마지막 인덱스를 가져오겠습니다.');
      const { data: lastItem, error: queryError } = await supabase
        .from('planitems')
        .select('sort_order')
        .eq('group_id', item.group_id)
        .eq('day', item.day)
        .order('sort_order', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (queryError) {
        throw new Error(`Failed to query last item: ${queryError.message}`);
      }

      lastSortOrder = lastItem?.sort_order || null;
    }

    // Fractional index + 지터로 새 키 생성
    const baseKey = generateKeyBetween(lastSortOrder, null);
    const finalKey = `${baseKey}_${createJitter()}`;

    const newItem = {
      ...item,
      sort_order: finalKey,
      duration: item.duration || 120 // 기본값 2시간
    };

    // DB에 삽입
    const { data, error } = await supabase
      .from('planitems')
      .insert(newItem)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to insert plan item: ${error.message}`);
    }

    console.log('✅ Plan item inserted successfully');
    return data;

  } catch (error) {
    console.error('Error inserting plan item:', error);
    throw error;
  }
}