import searchIcon from "@/assets/icons/search_icon.svg";
import { useRef } from "react";
import { FaTimes } from "react-icons/fa";

interface SearchBoxProps {
  onSearch: (query: string) => void;
  isSearching: boolean;
  onClear: () => void;
  onFocus: () => void;
}

function SearchBox({
  onSearch,
  isSearching,
  onClear,
  onFocus,
}: SearchBoxProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleSearch = () => {
    const query = searchInputRef.current?.value.trim();
    if (query) {
      onSearch(query);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // 맥의 한글 IME 중복 처리 방지
    if (e.nativeEvent.isComposing) return;

    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  const handleClear = () => {
    if (searchInputRef.current) {
      searchInputRef.current.value = "";
    }
    onClear();
  };

  const handleFocus = () => {
    onFocus();
  };

  return (
    <div className="flex items-center gap-2 sm:gap-5 absolute top-12 left-12 right-12">
      <div className="flex gap-3 items-center flex-1 min-w-0 border border-gray-300 rounded-xl bg-white shadow-[2px_2px_2px_0_rgba(0,0,0,0.1)] px-3 py-1 h-12">
        <img src={searchIcon} alt="검색 아이콘" className="flex-shrink-0" />
        <input
          ref={searchInputRef}
          type="text"
          placeholder="장소를 입력하세요"
          className="flex-1 h-full min-w-0 outline-none placeholder-gray-400 text-xs sm:text-sm"
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          disabled={isSearching}
        />
        <button
          onClick={handleClear}
          className="flex-shrink-0 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          title="검색 지우기"
        >
          <FaTimes className="text-gray-500 text-sm" />
        </button>
      </div>
      <button
        className="flex items-center justify-center px-2 py-2 h-12 w-12 sm:w-16 rounded-xl text-white bg-primary shadow-[2px_2px_2px_0_rgba(0,0,0,0.1)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
        onClick={handleSearch}
        disabled={isSearching}
      >
        검색
      </button>
    </div>
  );
}
export default SearchBox;
