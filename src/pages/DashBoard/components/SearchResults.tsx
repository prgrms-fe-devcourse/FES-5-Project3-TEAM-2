import { useEffect, useRef } from "react";

interface SearchResult {
  id: string;
  name: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  rating?: number;
}

interface SearchResultsProps {
  results: SearchResult[];
  isVisible: boolean;
  onResultClick: (location: { lat: number; lng: number }) => void;
  onHide: () => void;
}

function SearchResults({ results, isVisible, onResultClick, onHide }: SearchResultsProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // 검색 결과 바깥 클릭 시
  useEffect(() => {
    if (!isVisible) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onHide();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible, onHide]);

  if (results.length === 0 || !isVisible) return null;

  const handleAddSchedule = (result: SearchResult) => {
    console.log("일정 추가:", result);
  };

  return (
    <div 
      ref={containerRef}
      className="absolute top-26 left-12 right-12 max-h-80 overflow-y-auto bg-white rounded-xl"
    >
      {results.map((result) => (
        <div
          key={result.id}
          className="p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer flex justify-between items-center last:border-b-0"
          onClick={() => onResultClick(result.location)}
        >
          <div>
            <div className="font-semibold">{result.name}</div>
            <div className="text-sm text-gray-600">{result.address}</div>
            {result.rating && (
              <div className="text-sm text-yellow-500">⭐ {result.rating}</div>
            )}
          </div>
          <button
            className="px-3 py-1 text-sm bg-secondary text-white rounded-lg hover:bg-primary"
            onClick={(e) => {
              e.stopPropagation();
              handleAddSchedule(result);
            }}
          >
            일정 추가
          </button>
        </div>
      ))}
    </div>
  );
}

export default SearchResults;