

import { errorAlert, toast } from "@/components/Sweetalert";
import { supabase } from "@/lib/supabaseClient";
import type { Tables } from "@/types/supabase";
import { useCallback, useEffect, useState } from "react";
import { createGroupAndJoin, deleteGroup, fetchMyGroups } from "../api/groups";



export function useMyGroups(enabled = true) {
  const [groups, setGroups] = useState<Tables<'groups'>[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const uid = session?.user?.id;
      if (!uid) throw new Error("로그인이 필요합니다.");
      const rows = await fetchMyGroups(uid);
      setGroups(rows);
    } catch (e) {
      console.error("그룹 목록 로드 실패:", e);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    load();
  }, [load]);

  const addGroup = useCallback(
    async ({ name, startISO, endISO }: { name: string; startISO: string; endISO: string }) => {
      if (creating) return;
      setCreating(true);
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const uid = session?.user?.id;
        if (!uid) throw new Error("로그인이 필요합니다.");

        const newGroup = await createGroupAndJoin(uid, { name, startISO, endISO });

        // 새 카드 뒤쪽에 추가
        setGroups((prev) => [...prev, newGroup]);

        toast({
          title: "새 그룹 추가 완료!🌟",
          icon: "success",
          position: "top",
        });
      } catch (e) {
        await errorAlert({ title: "그룹 생성 실패", text: "다시 시도해주세요." });
        throw e; // 모달에서 에러 처리할 수 있게
      } finally {
        setCreating(false);
      }
    },
    [creating]
  );

  const removeGroup = async(id:string) => {
    try{
      setLoading(true);
      await deleteGroup(id);
      setGroups((prev)=>prev.filter((g) => g.id !== id));
    } finally {
      setLoading(false);
    }
  }

  return { groups, loading, creating, addGroup, reload: load, removeGroup };
}
