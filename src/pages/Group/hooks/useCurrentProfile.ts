import { supabase } from "@/lib/supabaseClient";
import { useProfileStore } from "@/store/profileStore";
import { useEffect } from "react";
import { useParams } from "react-router";


export default function useCurrentProfile() {
  const {userId} = useParams<{userId:string}>();

  const currentId = useProfileStore((s) => s.profile?.id);
  const fetchProfile  = useProfileStore((s) => s.fetchProfile);
  const clearProfile  = useProfileStore((s) => s.clearProfile);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      // url의 userId -> 세션의 userId
      let uid = userId;
      if(!uid) {
        const {data:{session}} = await supabase.auth.getSession();
        uid = session?.user.id;
      }

      // 비로그인 경우
      if (!uid) {
        clearProfile();
        return;
      }

      if(currentId === uid) return;


      if(cancelled) return;

      await fetchProfile(uid);
    })();

    return () => {
      cancelled = true;
    }
  }, [userId, currentId, fetchProfile, clearProfile]);




}
