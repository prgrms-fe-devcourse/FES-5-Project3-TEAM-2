import { MdEdit, MdOutlineDragIndicator } from "react-icons/md";
import { RiDeleteBin5Line } from "react-icons/ri";

interface Props {
  id: string;        
  title: string;      
  duration: number;   
  address: string | null;    
  sort_order: string; 
  displayIndex: number; // 화면에 보여줄 순번
}

function PlanItemOverlay({ title, duration, displayIndex }: Props) {
  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;

  return (
    <div className="h-[50px] pr-2 flex items-center gap-2 rounded-[10px] border-2 border-secondary font-extrabold bg-white shadow-lg">
      <MdOutlineDragIndicator className="size-10 text-gray-300"/>
      <span className="shrink-0 text-2xl text-primary">{displayIndex}</span>
      <p className="font-extrabold">{title}</p>
      <div className="ml-auto flex items-center gap-2">
        <p className="text-lg text-primary">
          {hours > 0 && `${hours}시간 `}
          {minutes > 0 && `${minutes}분`}
          {hours === 0 && minutes === 0 && "0분"}
        </p>
        <MdEdit className="size-6 text-gray-300" />
        <RiDeleteBin5Line className="size-6 text-gray-300" />
      </div>
    </div>
  );
}

export default PlanItemOverlay;
