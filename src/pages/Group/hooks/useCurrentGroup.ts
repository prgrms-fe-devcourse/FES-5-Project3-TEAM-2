
import { useGroupStore } from "@/store/groupStore";
import { useEffect } from "react";
import { useParams } from "react-router";

export default function useCurrentGroup() {
  const { groupId } = useParams<{ groupId?: string }>();

  const currentId = useGroupStore((s) => s.currentGroup?.id);
  const fetchGroup = useGroupStore((s) => s.fetchGroup);
  const clearGroup = useGroupStore((s) => s.clearGroup);

  useEffect(() => {
    if (!groupId) {
      // URL에 그룹이 없으면만 초기화
      clearGroup();
      return;
    }
    if (currentId === groupId) return;

    let cancelled = false;
    (async () => {
      await fetchGroup(groupId);
      if (cancelled) return;
    })();

    return () => {
      cancelled = true;
    };
  }, [groupId, currentId, fetchGroup, clearGroup]);
}
