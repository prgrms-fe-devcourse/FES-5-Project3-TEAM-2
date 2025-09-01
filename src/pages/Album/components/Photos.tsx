import React, { useState } from "react";
import { FaPlus } from "react-icons/fa";
import type { Photo } from "../types/photo";
import { VirtuosoGrid, type VirtuosoGridHandle } from "react-virtuoso";
import Loading from "./Loading";
import LoadingMore from "./LoadingMore";
import { EndMessage } from "./EndMessage";
import { EmptyState } from "./EmptyState";
import { PhotoItem } from "./PhotoItem";

interface PhotoGridProps {
  photos: Photo[];
  isLoading?: boolean;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onFilesDropped: (files: FileList) => void;
  onDeletePhoto: (photoId: string) => void;
  onDownloadPhoto: (photo: Photo) => void;
  onLoadMore: () => void;
  virtuosoRef?: React.RefObject<VirtuosoGridHandle | null>;
}

function Photos({
  photos,
  isLoading,
  hasMore,
  isLoadingMore,
  onFilesDropped,
  onDeletePhoto,
  onDownloadPhoto,
  onLoadMore,
  virtuosoRef,
}: PhotoGridProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [showEndMessage, setShowEndMessage] = useState(false);

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
    return <Loading />;
  }

  if (photos.length === 0) {
    return (
      <EmptyState
        isDragOver={isDragOver}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      />
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
        ref={virtuosoRef}
        className="scrollbar scrollbar-thumb-primary scrollbar-track-transparent pr-2"
        style={{ height: "100%" }}
        totalCount={photos.length}
        components={gridComponents}
        itemContent={(index) => {
          const photo = photos[index];
          if (!photo) return null;

          return (
            <PhotoItem
              photo={photo}
              onDownload={onDownloadPhoto}
              onDelete={onDeletePhoto}
            />
          );
        }}
        computeItemKey={(index) => photos[index]?.id || index}
        initialItemCount={Math.min(photos.length, 30)}
        overscan={18}
        endReached={() => {
          if (hasMore && !isLoadingMore) {
            onLoadMore();
          } else if (!hasMore) {
            setShowEndMessage(true);
          }
        }}
      />
      {!isLoading && isLoadingMore && <LoadingMore />}
      {!hasMore && photos.length > 0 && !isLoadingMore && showEndMessage && (
        <EndMessage
          showEndMessage={showEndMessage}
          onHide={() => setShowEndMessage(false)}
        />
      )}
    </div>
  );
}

export default Photos;
