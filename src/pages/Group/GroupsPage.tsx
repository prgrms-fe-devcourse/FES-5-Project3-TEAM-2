import { supabase } from "@/lib/supabaseClient";
import { useProfileStore } from "@/store/profileStore";
import { useEffect } from "react";
import { useParams } from "react-router";


function GroupsPage() {
  const {userId} = useParams<{userId: string}>(); // URL에서 userId 가져오기
  const { profile, setProfile } = useProfileStore();
  useEffect(() => {
    const fetchProfile = async () => {
      const {data} = await supabase
      .from('profile')
      .select('name, avatar_url')
      .eq('id', userId)
      .single();
      setProfile(data);
    };
    fetchProfile();
  },[userId, setProfile]);

  if (!profile) return <p>프로필 불러오는 중...</p>;

  return (
    <div>
      <h1>그룹페이지</h1>
    </div>
  );
}
export default GroupsPage
