import dragIcon from "@/assets/icons/drag_indicator_icon.png";
import deleteIcon from "@/assets/icons/delete_icon.png";
import editIcon from "@/assets/icons/edit_icon.png";

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
    <div className="h-[60px] pr-2 flex items-center gap-2 rounded-[10px] border-2 border-secondary font-extrabold bg-white shadow-lg">
      <img src={dragIcon} className="size-10" />
      <span className="shrink-0 text-2xl text-primary">{displayIndex}</span>
      <p className="font-extrabold">{title}</p>
      <div className="ml-auto flex items-center gap-2">
        <p className="text-lg text-primary">
          {hours > 0 && `${hours}시간 `}
          {minutes > 0 && `${minutes}분`}
          {hours === 0 && minutes === 0 && "0분"}
        </p>
        <img src={editIcon} className="size-6" />
        <img src={deleteIcon} className="size-6" />
      </div>
    </div>
  );
}

export default PlanItemOverlay;
