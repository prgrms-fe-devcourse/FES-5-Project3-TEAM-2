import { useEffect } from "react";
import { useParams } from "react-router";
import { supabase } from "@/lib/supabaseClient";
import { usePresenceStore } from "@/pages/DashBoard/store/presenceStore";

type Props = {
  children: React.ReactNode;
};


export default function GroupPresenceProvider({ children }: Props) {
  const { groupId } = useParams<{ groupId: string }>();

  useEffect(() => {
    if (!groupId) return;
    let mounted = true;

    let channel: ReturnType<typeof supabase.channel> | null = null;

    async function setupPresenceChannel() {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id ?? "guest";

      channel = supabase.channel(`presence_${groupId}`, {
        config: { presence: { key: userId } },
      });

      // 서버에서 presence 목록 동기화 될 때마다 실행
      channel.on("presence", { event: "sync" }, () => {
        if (!mounted) return;

        // presenceState()의 형태는 { [userId]: Array<meta> }
        type PresenceMeta = {
          user_id?: string;
          user_name?: string;
          online_at?: string;
        };
        const state = channel!.presenceState() as Record<string, PresenceMeta[]>;

        const onlineIds = Object.keys(state);

        // id -> name 맵 생성 (가장 최근 메타 정보 우선)
        const idNameMap: Record<string, string> = {};
        for (const [id, metas] of Object.entries(state)) {
          const meta = metas && metas.length > 0 ? metas[metas.length - 1] : undefined;
          const userName = typeof meta?.user_name === "string" && meta.user_name.trim().length > 0
            ? meta.user_name
            : "알 수 없음";
          idNameMap[id] = userName;
        }

        const store = usePresenceStore.getState();
        store.setOnlineUserIds(onlineIds);
        store.setOnlineUsersById(idNameMap);
      });

      // 채널에 정상적으로 구독되면 내 presence 등록
      channel.subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          // 내 이름을 presence에 함께 실어 전송
          let userName = usePresenceStore.getState().myProfile?.name ?? "";
          if (!userName && userId && userId !== "guest") {
            try {
              const { data: profileRow } = await supabase
                .from("profile")
                .select("name")
                .eq("id", userId)
                .maybeSingle();
              userName = profileRow?.name ?? "";
            } catch {
              // noop - 이름 없으면 빈 문자열 처리
            }
          }

          channel?.track({
            user_id: userId,
            user_name: userName || "",
            online_at: new Date().toISOString(),
          });
        }
      });
    }

    setupPresenceChannel();

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
