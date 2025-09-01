

import { errorAlert, toast } from "@/components/Sweetalert";
import { supabase } from "@/lib/supabaseClient";
import type { Tables } from "@/types/supabase";
import { useCallback, useEffect, useState } from "react";
import { createGroupAndJoin, deleteGroup, fetchMyGroups } from "../api/groups";

const toISO = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

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

  const addGroup = useCallback(async () => {
    if (creating) return;
    setCreating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const uid = session?.user?.id;
      if (!uid) throw new Error("로그인이 필요합니다.");

      const today = new Date();
      const end = new Date(today);
      end.setDate(today.getDate() + 2);

      const newGroup = await createGroupAndJoin(uid, {
        name: "새 여행",
        startISO: toISO(today),
        endISO: toISO(end),
      });

      setGroups((prev) => [...prev, newGroup]); // 새카드 추가 -> 뒤에서 생기게
      toast({
        title: "새 그룹 추가 완료!🌟",
        icon: "success",
        position: "top",
      });
    } catch (e) {
      console.error(e);
      await errorAlert({ title: "그룹 생성 실패", text: "다시 시도해주세요." });
    } finally {
      setCreating(false);
    }
  }, [creating]);

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
