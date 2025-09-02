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
        const state = channel!.presenceState() as Record<string, unknown>;
        const onlineIds = Object.keys(state);
        usePresenceStore.getState().setOnlineUserIds(onlineIds);
      });

      // 채널에 정상적으로 구독되면 내 presence 등록
      channel.subscribe((status) => {
        if (status === "SUBSCRIBED") {
          channel?.track({ user_id: userId, online_at: new Date().toISOString() });
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
