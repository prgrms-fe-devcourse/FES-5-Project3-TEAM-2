import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import dragIcon from "@/assets/icons/drag_indicator_icon.png";
import deleteIcon from "@/assets/icons/delete_icon.png";
import editIcon from "@/assets/icons/edit_icon.png";

interface Props {
  index: number;
  content: string;
  hour: number;
}

function PlanItem({ index, content, hour }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: String(index) });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li ref={setNodeRef} style={style}>
      <article className="h-[60px] pr-2 flex items-center gap-2 rounded-[10px] border-2 border-secondary font-extrabold bg-white">
        <img
          src={dragIcon}
          className="size-10 cursor-grab active:cursor-grabbing"
          draggable={false}
          {...attributes}
          {...listeners}
        />
        <span className="shrink-0 text-2xl text-primary">{index}</span>
        <p className="font-extrabold">{content}</p>
        <div className="ml-auto flex items-center gap-2">
          <p className="text-lg text-primary">{hour}시간</p>
          <img src={editIcon} className="size-6 cursor-pointer" />
          <img src={deleteIcon} className="size-6 cursor-pointer" />
        </div>
      </article>
    </li>
  );
}

export default PlanItem;
