import { HiDownload } from "react-icons/hi";
import type { Photo } from "../types/photo";
import { HiTrash } from "react-icons/hi2";

interface PhotoItemProps {
  photo: Photo;
  onDownload: (photo: Photo) => void;
  onDelete: (photoId: string) => void;
}

export const PhotoItem = ({ photo, onDownload, onDelete }: PhotoItemProps) => (
  <div className="relative group w-full h-full">
    <img
      src={photo.url}
      alt={photo.id}
      className="w-full h-full object-cover"
    />
    <div className="absolute top-2 right-2 flex flex-row gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <button
        onClick={() => onDownload(photo)}
        className="p-1 rounded-full bg-gray-500 bg-opacity-50 text-white hover:bg-opacity-70"
        title="다운로드"
      >
        <HiDownload size={16} />
      </button>
      <button
        onClick={() => onDelete(photo.id)}
        className="p-1 rounded-full bg-gray-500 bg-opacity-50 text-white hover:bg-opacity-70"
        title="삭제"
      >
        <HiTrash size={16} />
      </button>
    </div>
  </div>
);
