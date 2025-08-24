import searchIcon from "@/assets/icons/search_icon.svg";

function SearchBox() {
  return (
    <div className="flex items-center gap-5 w-full">
      <div className="flex gap-3 items-center flex-1 border border-gray-300 rounded-xl bg-white shadow-[2px_2px_2px_0_rgba(0,0,0,0.1)] px-2 py-2">
        <img src={searchIcon} alt="검색 아이콘" />
        <input
          type="text"
          placeholder="가고 싶은 장소를 입력하세요"
          className="flex-1 h-full outline-none placeholder-gray-400"
        />
      </div>
      <button className="flex items-center justify-center px-2 py-2 rounded-xl text-white bg-secondary shadow-[2px_2px_2px_0_rgba(0,0,0,0.1)] cursor-pointer">
        검색
      </button>
    </div>
  );
}
export default SearchBox;
