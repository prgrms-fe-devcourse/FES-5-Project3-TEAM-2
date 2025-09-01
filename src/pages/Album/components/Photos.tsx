import React, { useState } from "react";
import { HiOutlinePhoto, HiTrash } from "react-icons/hi2";
import { FaPlus } from "react-icons/fa";
import type { Photo } from "../types/photo";
import { VirtuosoGrid } from "react-virtuoso";
import { HiDownload } from "react-icons/hi";

interface PhotoGridProps {
  photos: Photo[];
  isLoading?: boolean;
  onFilesDropped: (files: FileList) => void;
  onDeletePhoto: (photoId: string) => void;
  onDownloadPhoto: (photo: Photo) => void;
}

function Photos({
  photos,
  isLoading,
  onFilesDropped,
  onDeletePhoto,
  onDownloadPhoto,
}: PhotoGridProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.types.includes("Files")) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (e.dataTransfer.files.length > 0) {
      onFilesDropped(e.dataTransfer.files);
    }
  };

  const gridComponents = {
    List: React.forwardRef<HTMLDivElement, React.HTMLProps<HTMLDivElement>>(
      ({ children, ...props }, ref) => (
        <div
          {...props}
          ref={ref}
          className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-0"
        >
          {children}
        </div>
      ),
    ),
    Item: React.forwardRef<HTMLDivElement, React.HTMLProps<HTMLDivElement>>(
      ({ children, ...props }, ref) => (
        <div {...props} ref={ref} className="aspect-square">
          {children}
        </div>
      ),
    ),
  };

  if (isLoading) {
    return (
      <div
        className={`relative flex flex-col items-center justify-center h-full w-full text-gray-500 transition-colors ${
          isDragOver ? "border-blue-500 bg-blue-50 border-2 border-dashed" : ""
        }`}
        style={{ gridAutoRows: "auto" }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isDragOver && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none bg-blue-50">
            <FaPlus className="w-6 h-6 text-blue-500 mb-2" />
            <p className="text-center text-lg font-medium text-gray-500">
              사진을 여기에 놓으세요
            </p>
          </div>
        )}

        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white bg-opacity-70">
          <div className="flex space-x-2 mb-2">
            <div className="w-3 h-3 bg-primary rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-3 h-3 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          </div>
          <p className="text-center text-lg font-medium text-gray-600">
            잠시만 기다려주세요
          </p>
        </div>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div
        className={`relative flex flex-col items-center justify-center py-12 text-gray-500 transition-colors ${
          isDragOver ? "border-blue-500 bg-blue-50 border-2 border-dashed" : ""
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
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
  }

  return (
    <div
      className={`relative h-full w-full transition-colors ${
        isDragOver ? "border-blue-500 bg-blue-50 border-2 border-dashed" : ""
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDragOver && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none bg-blue-50">
          <FaPlus className="w-6 h-6 text-blue-500 mb-2" />
          <p className="text-center text-lg font-medium text-gray-500">
            사진을 여기에 놓으세요
          </p>
        </div>
      )}
      <VirtuosoGrid
        style={{ height: "100%" }}
        totalCount={photos.length}
        components={gridComponents}
        itemContent={(index) => {
          const photo = photos[index];
          if (!photo) return null;

          return (
            <div className="relative group w-full h-full">
              <img
                src={photo.url}
                alt={photo.id}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2 flex flex-row gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {/* 다운로드 버튼 */}
                <button
                  onClick={() => onDownloadPhoto(photo)}
                  className="p-1 rounded-full bg-gray-500 bg-opacity-50 text-white hover:bg-opacity-70"
                  title="다운로드"
                >
                  <HiDownload size={16} />
                </button>
                
                {/* 삭제 버튼 */}
                <button
                  onClick={() => onDeletePhoto(photo.id)}
                  className="p-1 rounded-full bg-gray-500 bg-opacity-50 text-white hover:bg-opacity-70"
                  title="삭제"
                >
                  <HiTrash size={16} />
                </button>
              </div>
            </div>
          );
        }}
        computeItemKey={(index) => photos[index]?.id || index}
        overscan={20}
        initialItemCount={30}
      />
    </div>
  );
}

export default Photos;
