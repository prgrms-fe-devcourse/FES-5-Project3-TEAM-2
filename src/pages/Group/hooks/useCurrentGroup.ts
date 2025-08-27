import { supabase } from "@/lib/supabaseClient";
import { useGroupStore } from "@/store/groupStore";
import { useEffect } from "react";
import { useParams } from "react-router";


export default function useCurrentGroup() {
  const {groupId} = useParams<{groupId?:string}>();

  const currentGroup = useGroupStore((s) => s.currentGroup);
  const setCurrentGroup = useGroupStore((s) => s.setCurrentGroup);
  const clearGroup = useGroupStore((s) => s.clearGroup);


  useEffect(() => {
    if(!groupId) {
      clearGroup();
      return;
    }

    if(currentGroup?.id === groupId) return;

    (async () => {
      const {data, error} = await supabase
      .from('groups')
      .select('id, name')
      .eq('id', groupId)
      .single();

      if(error) {
        console.error('그룹 불러오기 실패:', error.message);
        clearGroup();
      } else {
        setCurrentGroup(data);
      }
    })();
  },[groupId, setCurrentGroup, clearGroup]);


}
