import { supabase } from "@/lib/supabaseClient";

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

// 편집 업데이트용 파라미터
export interface UpdatePlanItemParams {
  itemId: string;
  groupId: string;
  day: string; // 'YYYY-MM-DD' format
  title: string;
  duration: number;
}


export async function editUpdate({
  itemId,
  groupId,
  day,
  title,
  duration
}: UpdatePlanItemParams): Promise<PlanItem> {
  try {
    if (!itemId || !groupId || !day) {
      throw new Error('필수 파라미터 (itemId, groupId, day)가 누락되었습니다.');
    }

    if (!title || title.trim().length === 0) {
      throw new Error('타이틀은 필수입니다.');
    }

    if (duration <= 0 && duration > 24) {
      throw new Error('듀레이션은 0보다 크고 24보다 작아야 합니다.');
    }

    // console.log(`🔧 Plan Item 편집:`);
    // console.log(`   ID: ${itemId}`);
    // console.log(`   제목: ${title}`);
    // console.log(`   시간: ${duration}분`);

    // Supabase 업데이트
    const { data, error } = await supabase
      .from('planitems')
      .update({ 
        title: title.trim(),
        duration 
      })
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

    console.log('✅ Plan item updated successfully');
    return data;

  } catch (error) {
    console.error('❌ Error updating plan item:', error);
    throw error;
  }
}