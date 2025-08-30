import {supabase} from "@/lib/supabaseClient"
import type { Database } from "@/types/supabase";

export type Group = Database["public"]["Tables"]["groups"]["Row"];

export async function loadGroupData(groupId: string): Promise<Group | null> {
 const { data, error } = await supabase
   .from('groups')
   .select('*')
   .eq('id', groupId)
   .single();

 if (error) {
   console.error('그룹 데이터를 가져오는데 에러가 발생하였습니다. :', error);
   return null;
 }

 return data as Group;
}