

import { supabase } from "@/lib/supabaseClient";
import { useCallback, useEffect, useState } from "react";
import { createGroupAndJoin, fetchMyGroups } from "../api/groups";
import type { Group } from "../types/groups";

const toISO = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export function useMyGroups(enabled = true) {
  const [groups, setGroups] = useState<Group[]>([]);
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

      setGroups((prev) => [newGroup, ...prev]);
    } catch (e) {
      alert("그룹 생성에 실패했습니다.");
      console.error(e);
    } finally {
      setCreating(false);
    }
  }, [creating]);

  return { groups, loading, creating, addGroup, reload: load };
}
