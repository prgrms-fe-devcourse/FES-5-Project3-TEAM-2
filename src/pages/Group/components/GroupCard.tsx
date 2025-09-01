import cardbg from "@/assets/cardbg.png";
import edit from "@/assets/icons/cardedit.svg";
import { confirmDialog, errorAlert, toast } from "@/components/Sweetalert";
import { supabase } from "@/lib/supabaseClient";
import type { Tables } from "@/types/supabase";
import { useNavigate, useParams } from "react-router";
import Swal from "sweetalert2";

type Props = {
  g: Tables<"groups">;
  openMenuId?: string | null;
  setOpenMenuId?: (id:string | null) => void;
  onDelete: (id:string) => Promise<void> | void;
}

const formatDate = (iso?: string) => {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${y.slice(2)}.${m}.${d}`;
};

export default function GroupCard({ g, openMenuId, setOpenMenuId, onDelete }: Props) {

  const navigate = useNavigate();
  const {userId} = useParams<{userId:string}>();

  const menuOpen = openMenuId === g.id;

  const openDashboard = () => {
    navigate(`/groups/${userId}/g/${g.id}`);
  }

  const handleCardClick = (e:React.MouseEvent) => {
    if(menuOpen){
      e.stopPropagation();
      setOpenMenuId?.(null);
      return;
    }
    openDashboard();
  }

  const copyInvite = async (e:React.MouseEvent) => {
    e.stopPropagation();

    const url = `${window.location.origin}/g/${g.id}`;

      // 모바일/지원 브라우저
      if(navigator.share){
        await navigator.share({title:'그룹 초대', url});
        return;
      }

      // Clipboard API
      await navigator.clipboard.writeText(url);
    }

  const onEditClick = (e:React.MouseEvent) => {
    e.stopPropagation();
    setOpenMenuId?.(menuOpen ? null : g.id);
  };

  const isOwnerPromise = async() => {
    const {data:{user}} = await supabase.auth.getUser();
    return user?.id === g.owner_id;
  }

  const handleDelete = async (e:React.MouseEvent) => {
    e.stopPropagation();

    const isOwner = await isOwnerPromise();
    if(!isOwner) {
      await errorAlert({title:'삭제 권한 없음', text:'그룹 삭제 권한이 없습니다.'})
      setOpenMenuId?.(null);
      return;
    }

    try{
    const ok = await confirmDialog({ title: "정말 삭제하시겠습니까?", text: "삭제된 그룹은 되돌릴 수 없습니다.", icon: "warning", confirmButtonText: "삭제", cancelButtonText: "취소" });
    if (!ok) return;
      await onDelete(g.id);
      Swal.close();
      await toast({ title: "삭제가 완료되었습니다.", icon: "success", position: "top" });
    } catch (err) {
      await errorAlert({ title: "삭제 실패", text: "다시 시도해주세요." });
    } finally {
      setOpenMenuId?.(null);
    }
  }


  return (
    <div
    onClick={handleCardClick}
    className="w-full max-w-[480px] aspect-[20/9] bg-white rounded-2xl cursor-pointer drop-shadow-[4px_4px_4px_rgba(0,0,0,0.25)]">
      <div className="relative aspect-[20/9]">
          <img src={cardbg} alt="배경이미지" className="h-full w-full object-cover rounded-t-2xl" />
          <h3 className="absolute left-5 top-5 text-7 font-extrabold text-white shadow-[4px_4px_4px_rgba(0,0,0,0.25)]">
            {g.name}
          </h3>

          <div className="absolute right-4 top-4">
            <button
            type="button"
            onClick={onEditClick}
            className="px-4 py-3 hover:bg-gray-50/50 hover:px-4 rounded-3xl cursor-pointer"
          >
            <img src={edit} alt="카드 편집 버튼" />
          </button>

          {menuOpen && (
            <div
            onClick={(e)=>e.stopPropagation()}
            className="absolute right-0 mt-2 w-36 rounded-2xl bg-white z-20 overflow-hidden"
            >
              <button
              type="button"
              className="w-full px-4 py-3 text-left text-sm hover:bg-fourth hover:text-tertiary transition cursor-pointer"
              onClick={(e)=>{
                e.stopPropagation();
                setOpenMenuId?.(null);
              }}
              >
                배경 이미지 수정
              </button>
              <div />
              <button
              type="button"
              className="w-full px-4 py-3 text-left text-sm hover:bg-fourth hover:text-tertiary transition cursor-pointer"
              onClick={handleDelete}
              >
                그룹 삭제
              </button>
            </div>
          )}
          </div>


      <div className="flex items-center justify-between px-6 py-3 rounded-b-2xl">
        <p className="text-1">
          {formatDate(g.start_day)} ~ {formatDate(g.end_day)}
        </p>
        <button
          type="button"
          onClick={copyInvite}
          className="text-1 text-white bg-tertiary px-3 py-2 rounded-4xl cursor-pointer hover:bg-fourth hover:text-tertiary transition"
        >
          초대링크 복사
        </button>
      </div>

      </div>
    </div>
  );
}
