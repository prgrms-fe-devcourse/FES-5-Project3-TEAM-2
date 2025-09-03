// GroupPresenceProvider.tsx
import { useEffect } from "react";
import { useParams } from "react-router";
import { supabase } from "@/lib/supabaseClient";
import { usePresenceStore } from "@/pages/DashBoard/store/presenceStore";

type Props = {
  children: React.ReactNode;
};

type PresenceMeta = {
  user_id?: string;
  user_name?: string;
  online_at?: string;
};

export default function GroupPresenceProvider({ children }: Props) {
  const { groupId } = useParams<{ groupId: string }>();

  useEffect(() => {
    if (!groupId) return;
    let mounted = true;

    
    let channel: ReturnType<typeof supabase.channel> | null = null;

    function handlePresenceSync() {
      if (!mounted || !channel) return;

      const state = channel.presenceState() as Record<string, PresenceMeta[]>;
      const onlineIds = Object.keys(state);

      // id → name 매핑 (가장 최근 메타 정보 우선)
      const idNameMap: Record<string, string> = {};
      for (const [id, metas] of Object.entries(state)) {
        const meta = metas?.at(-1);
        idNameMap[id] =
          meta?.user_name?.trim()?.length ? meta.user_name : "알 수 없음";
      }

      const store = usePresenceStore.getState();
      store.setOnlineUserIds(onlineIds);
      store.setOnlineUsersById(idNameMap);
    }

    async function trackMyPresence(userId: string) {
      let userName = usePresenceStore.getState().myProfile?.name ?? "";

      // 프로필 이름이 비어 있으면 DB에서 한 번 조회
      if (!userName && userId !== "guest") {
        try {
          const { data: profileRow } = await supabase
            .from("profile")
            .select("name")
            .eq("id", userId)
            .maybeSingle();
          userName = profileRow?.name ?? "";
        } catch {
          // noop: 조회 실패 시 빈 문자열 유지
        }
      }

      channel?.track({
        user_id: userId,
        user_name: userName,
        online_at: new Date().toISOString(),
      });
    }

    async function setupPresenceChannel() {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id ?? "guest";

      channel = supabase.channel(`presence_${groupId}`, {
        config: { presence: { key: userId } },
      });

      // 서버에서 presence 목록 동기화
      channel.on("presence", { event: "sync" }, handlePresenceSync);

      // 채널 구독 후 내 presence 등록
      channel.subscribe((status) => {
        if (status === "SUBSCRIBED") {
          void trackMyPresence(userId);
        }
      });
    }

    void setupPresenceChannel();

    // cleanup
    return () => {
      mounted = false;
      if (channel) {
        void channel.untrack();
        supabase.removeChannel(channel);
      }
    };
  }, [groupId]);

  return <>{children}</>;
}
