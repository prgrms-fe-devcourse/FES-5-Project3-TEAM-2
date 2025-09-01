import { supabase } from "@/lib/supabaseClient";
import type { Tables } from "@/types/supabase";



export async function fetchMyGroups(userId:string) {
  const { data, error } = await supabase
    .from("groups")
    .select("id, name, owner_id, start_day, end_day, groupmembers!inner(user_id)")
    .eq("groupmembers.user_id", userId)
    .order("start_day", { ascending: true }); // 여행시작일 빠른게 앞에 보이게

    if (error) throw error;

    return (data ?? []).map(
      (g) => ({
            id: g.id,
            name: g.name,
            owner_id: g.owner_id,
            start_day: g.start_day,
            end_day: g.end_day,
          })) as Tables<'groups'>[]
}


export async function createGroupAndJoin(
  ownerId:string,
  { name, startISO, endISO } : {name:string, startISO:string, endISO:string}
) {
  // 1) 그룹 생성
  const payload = {
    id: crypto.randomUUID(),
    name,
    owner_id: ownerId,
    start_day: startISO,
    end_day: endISO,
  };

  const { data: created, error: cErr } = await supabase
    .from("groups")
    .insert([payload])
    .select("id, name, owner_id, start_day, end_day")
    .single<Tables<'groups'>>();

  if (cErr) throw cErr;

  // 2) 멤버로 본인 추가
  const { error: mErr } = await supabase
    .from("groupmembers")
    .insert([{ group_id: created.id, user_id: ownerId, role: "admin" }]);

  if (mErr) console.error("groupmembers 추가 실패:", mErr);

  return created;
}

// 그룹카드 삭제
export async function deleteGroup(group_id:string){
  const {error} = await supabase
  .from('groups')
  .delete()
  .eq('id', group_id);
  if(error) throw error;
}
