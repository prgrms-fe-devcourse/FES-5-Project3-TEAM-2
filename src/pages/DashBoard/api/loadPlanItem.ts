import {supabase} from "@/lib/supabaseClient"

export interface PlanItem {
 id: string;
 group_id: string;
 title: string;
 address: string | null;
 latitude: number | null;
 longitude: number | null;
 sort_order: number;
 duration: number;
 day: string; // 'YYYY-MM-DD' format
}

export async function loadPlanItemsByDay(groupId: string, day: string): Promise<PlanItem[] | null> {
  const { data, error } = await supabase
    .from('planitems')
    .select('*')
    .eq('group_id', groupId)
    .eq('day', day)
    .order('sort_order');
    
  if (error) {
    console.error('Error loading plan items:', error);
    return null;
  }
    
  return data as PlanItem[];
}