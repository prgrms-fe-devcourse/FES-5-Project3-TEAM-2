import { errorAlert, toast } from "@/components/Sweetalert";
import { supabase } from "@/lib/supabaseClient";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router";


export default function GroupJoinPage() {

  const {groupId} = useParams<{groupId:string}>();
  const navigate = useNavigate();

  useEffect(() => {
    if(!groupId) {
      errorAlert({title:'잘못된 링크', text:'존재하지 않는 초대 링크입니다.'});
      return;
    }


  (async () => {
    // 1) 세션 확인
    let {data:{session}} = await supabase.auth.getSession();

    // 2) 로그인 상태 아니면 소셜 로그인으로 이동
    if(!session) {
      await supabase.auth.signInWithOAuth({
        provider:'google',
        options: {redirectTo:window.location.href}
      });
      return;
    }

    try {
      const uid = session.user.id;

      // 3) 멤버 upsert (중복이면 무시)
      const {error: mErr} = await supabase
      .from('groupmembers')
      .upsert(
        [{group_id:groupId, user_id:uid, role:'member'}],
        {onConflict: 'group_id, user_id', ignoreDuplicates:true} // group_id랑 user_id 둘다 이미 존재하면 아무것도 안함
      );

      if(mErr){
        errorAlert({title:'가입 실패', text:mErr.message});
        return;
      }

      // 4) 참여한 그룹 대시보드로 이동
      await toast({
        title: "초대받은 그룹으로 이동중... 🌱",
        icon: "success",
        position: "top-end"
      });

      setTimeout(() => {
        navigate(`/groups/${uid}/g/${groupId}`, {replace:true});
      })

    } catch (e:unknown){
      errorAlert({title:'오류 발생', text:'다시 시도해주세요.'});
    }
  })();
  }, [groupId, navigate]);

  return null;
}
