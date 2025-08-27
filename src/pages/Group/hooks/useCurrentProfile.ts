import { supabase } from "@/lib/supabaseClient";
import { useProfileStore } from "@/store/profileStore";
import { useEffect } from "react";
import { useParams } from "react-router";


export default function useCurrentProfile() {
  const {userId} = useParams<{userId:string}>();

  const profile = useProfileStore((s) => s.profile);
  const setProfile = useProfileStore((s) => s.setProfile);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      // url의 userId -> 세션의 userId
      let uid = userId;
      if(!uid) {
        const {data:{session}} = await supabase.auth.getSession();
        uid = session?.user.id;
      }

      if(!uid) return; // 비로그인 경우

      if(profile?.id === uid) return;


      const {data, error} = await supabase
      .from('profile')
      .select('id, name, avatar_url')
      .eq('id', uid)
      .single();

      if(cancelled) return;

      if(!error && data) {
        setProfile(data);
      }
    })();

    return () => {
      cancelled = true;
    }
  }, [userId, setProfile]);




}
