function TripInfo() {
  return (
         <section className="flex flex-col gap-6">
      <header className="flex">
        <h2 className="text-[28px] font-bold leading-none">
          우리 그룹의 여행 정보 ✈️
        </h2>
      </header>

      <div className="flex rounded-2xl bg-[#FAECF2]">

          <div className="flex w-full items-stretch gap-10 divide-x divide-gray-300 py-5">
          <div className="flex flex-1 flex-col items-center gap-1">
            <p className="font-bold">장소</p>
            <p className="text-[36px] font-bold leading-tight">제주도</p>
          </div>

          <div className="flex flex-1 flex-col items-center">
            <p className="font-bold">날짜 및 시간</p>
            <p className="text-[36px] font-bold leading-tight">
              <time>2025.08.20</time>
            </p>
            <p className="text-[36px] font-bold leading-tight">
              ~ <time>2025.08.23</time>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
export default TripInfo;
