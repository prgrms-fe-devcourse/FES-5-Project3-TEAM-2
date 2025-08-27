import cardbg from "@/assets/cardbg.png";
import edit from "@/assets/icons/cardedit.svg";
import { useNavigate, useParams } from "react-router";
import type { Group } from "../types/groups";

type Props = {
  g: Group;
}

const formatDate = (iso?: string) => {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${y.slice(2)}.${m}.${d}`;
};

export default function GroupCard({ g }: Props) {

  const navigate = useNavigate();
  const {userId} = useParams<{userId:string}>();

  const openDashboard = () => {
    navigate(`/groups/${userId}/g/${g.id}`);
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
      alert('초대 링크가 복사되었습니다.');
    }

  const onEditClick = (e:React.MouseEvent) => {
    e.stopPropagation();
  };


  return (
    <div
    onClick={openDashboard}
    className="w-full max-w-[480px] aspect-[20/9] bg-white rounded-2xl cursor-pointer drop-shadow-[4px_4px_4px_rgba(0,0,0,0.25)]">
      <div className="relative aspect-[20/9]">
          <img src={cardbg} alt="배경이미지" className="h-full w-full object-cover rounded-t-2xl" />
          <h3 className="absolute left-5 top-5 text-7 font-extrabold text-white drop-shadow-[4px_4px_4px_rgba(0,0,0,0.25)]">
            {g.name}
          </h3>
          <button
            type="button"
            onClick={onEditClick}
            className="absolute right-4 top-4 px-4 py-3 hover:bg-gray-50/50 hover:px-4 rounded-3xl cursor-pointer"
          >
            <img src={edit} alt="카드 편집 버튼" />
          </button>


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
