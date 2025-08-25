import { supabase } from "@/lib/supabaseClient";
import { generateKeyBetween } from "fractional-indexing";
import { createJitter } from "../utils/createJitter";

// 기존 PlanItem 타입 재사용
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

// 드래그 앤 드롭용 확장 타입
export interface DraggedPlanItem extends PlanItem {
  dragged?: boolean; // 드래그된 아이템 표시용
}

// API 요청 파라미터
export interface UpdatePlanItemOrderParams {
  itemId: string;
  groupId: string;
  day: string; // 'YYYY-MM-DD' format
  currentItems: DraggedPlanItem[]; // 드래그 완료된 최종 리스트
}


export async function dragUpdate({
  itemId,
  groupId,
  day,
  currentItems
}: UpdatePlanItemOrderParams): Promise<PlanItem> {
  try {
    //  입력 검증
    if (!itemId || !groupId || !day || !currentItems || currentItems.length === 0) {
      throw new Error('필수 파라미터가 누락되었습니다.');
    }

    // 드래그된 아이템의 새 위치 찾기
    const draggedIndex = currentItems.findIndex(item => item.dragged === true);
    
    if (draggedIndex === -1) {
      throw new Error('dragged 플래그가 설정된 아이템을 찾을 수 없습니다.');
    }

    const draggedItem = currentItems[draggedIndex];
    
    // 보안 체크: 해당 아이템이 실제로 요청한 itemId와 일치하는지
    if (draggedItem.id !== itemId) {
      throw new Error('드래그된 아이템 ID가 일치하지 않습니다.');
    }

    // 앞뒤 아이템의 sort_order 추출
    const prevItem = currentItems[draggedIndex - 1];
    const nextItem = currentItems[draggedIndex + 1];
    
    const prevSortOrder = prevItem?.sort_order || null;
    const nextSortOrder = nextItem?.sort_order || null;

    // console.log(`🎯 아이템 "${draggedItem.title}" 이동:`);
    // console.log(`   위치: ${draggedIndex}`);
    // console.log(`   이전: ${prevSortOrder}`);
    // console.log(`   다음: ${nextSortOrder}`);

    // 새로운 sort_order 생성 
    const baseKey = generateKeyBetween(prevSortOrder, nextSortOrder);
    const finalKey = `${baseKey}_${createJitter()}`;

    if (!finalKey) {
      throw new Error('sort_order 생성에 실패했습니다.');
    }

    console.log(`새로운 sort_order: ${finalKey}`);

    // Supabase 업데이트
    const { data, error } = await supabase
      .from('planitems')
      .update({ sort_order: finalKey })
      .eq('id', itemId)
      .eq('group_id', groupId) 
      .eq('day', day)         
      .select()
      .single();

    if (error) {
      throw new Error(`Supabase 업데이트 실패: ${error.message}`);
    }

    if (!data) {
      throw new Error('업데이트할 아이템을 찾을 수 없습니다. (권한 또는 존재하지 않는 아이템)');
    }

    console.log('✅ Plan item order updated successfully');
    return data;

  } catch (error) {
    console.error('❌ Error updating plan item order:', error);
    throw error;
  }
}