import { useEffect, useRef } from "react";
import type { SearchResult } from "../types/map";
import exportLinkIcon from "@/assets/icons/external-link.png";

interface SearchResultsProps {
  results: SearchResult[];
  isVisible: boolean;
  onResultClick: (location: { lat: number; lng: number }) => void;
  onHide: () => void;
  onAddSchedule: (result: SearchResult) => void;
}

function SearchResults({
  results,
  isVisible,
  onResultClick,
  onHide,
  onAddSchedule,
}: SearchResultsProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // 검색 결과 바깥 클릭 시
  useEffect(() => {
    if (!isVisible) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        onHide();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isVisible, onHide]);

  const handleGoogleSearch = (result: SearchResult) => {
    const query = `${result.name}`;
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    window.open(searchUrl, "_blank");
  };

  if (results.length === 0 || !isVisible) return null;

  return (
    <div
      ref={containerRef}
      className="absolute top-26 left-12 right-12 max-h-60 sm:max-h-80 overflow-y-auto bg-white rounded-xl scrollbar-thin scrollbar-thumb-primary scrollbar-track-transparent"
    >
      {results.map((result) => (
        <div
          key={result.id}
          className="p-3 sm:p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer flex flex-col sm:flex-row justify-between sm:items-center last:border-b-0"
          onClick={() => onResultClick(result.location)}
        >
          <div className="flex-1 min-w-0 p-1">
            <div className="font-semibold">{result.name}</div>
            <div className="text-sm text-gray-600">{result.address}</div>
            {result.rating && (
              <div className="text-sm text-yellow-500">⭐ {result.rating}</div>
            )}
          </div>
          <div className="flex gap-2">
            <button
              className="px-2 py-1 sm:px-3 sm:py-1 text-xs sm:text-sm bg-primary text-white rounded-lg hover:bg-primary flex-shrink-0 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onAddSchedule(result);
              }}
            >
              일정 추가
            </button>
            <button
              className="w-7 h-7 flex items-center justify-center hover:opacity-100 flex-shrink-0 opacity-60 transition-opacity cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                handleGoogleSearch(result);
              }}
              title="구글에서 검색"
            >
              <img src={exportLinkIcon} alt="외부 링크" className="w-5 h-5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default SearchResults;
