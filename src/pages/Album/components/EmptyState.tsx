import { FaPlus } from "react-icons/fa";
import { HiOutlinePhoto } from "react-icons/hi2";

interface EmptyStateProps {
  isDragOver: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}

export const EmptyState = ({
  isDragOver,
  onDragOver,
  onDragLeave,
  onDrop,
}: EmptyStateProps) => (
  <div
    className={`relative flex flex-col items-center justify-center py-12 text-gray-500 transition-colors ${
      isDragOver ? "border-blue-500 bg-blue-50 border-2 border-dashed" : ""
    }`}
    onDragOver={onDragOver}
    onDragLeave={onDragLeave}
    onDrop={onDrop}
  >
    {isDragOver ? (
      <FaPlus className="w-6 h-6 mb-4 text-blue-500" />
    ) : (
      <HiOutlinePhoto className="w-16 h-16 mb-2" />
    )}
    {isDragOver ? (
      <p className="text-center text-lg font-medium text-gray-500">
        사진을 여기에 놓으세요
      </p>
    ) : (
      <>
        <p className="text-center text-lg font-medium mb-1">
          아직 업로드된 사진이 없습니다
        </p>
        <p className="text-center text-sm text-gray-400">
          사진을 드래그하거나 사진 추가 버튼을 눌러 업로드해보세요
        </p>
      </>
    )}
  </div>
);
