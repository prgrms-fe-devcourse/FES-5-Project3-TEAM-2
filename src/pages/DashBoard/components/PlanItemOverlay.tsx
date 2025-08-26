import dragIcon from "@/assets/icons/drag_indicator_icon.png";
import deleteIcon from "@/assets/icons/delete_icon.png";
import editIcon from "@/assets/icons/edit_icon.png";

interface Props {
  index: number;
  content: string;
  hour: number;
}

function PlanItemOverlay({ index, content, hour }: Props) {
  return (
    <div className="h-[60px] pr-2 flex items-center gap-2 rounded-[10px] border-2 border-secondary font-extrabold bg-white shadow-lg">
      <img src={dragIcon} className="size-10" />
      <span className="shrink-0 text-2xl text-primary">{index}</span>
      <p className="font-extrabold">{content}</p>
      <div className="ml-auto flex items-center gap-2">
        <p className="text-lg text-primary">{hour}시간</p>
        <img src={editIcon} className="size-6" />
        <img src={deleteIcon} className="size-6" />
      </div>
    </div>
  );
}

export default PlanItemOverlay;
