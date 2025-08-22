import dragIcon from '../../../assets/icons/drag_indicator_icon.png'


function Schedule() {
  return (
    <section className="flex-1 px-[100px] py-4">
      {/* 우리 그룹의 여행 정보 */}
      <header className="mb-6">
        <h2 className="text-[28px] font-bold">우리 그룹의 여행 정보 ✈️</h2>
      </header>

      <section
        aria-labelledby="trip-summary"
        className="mb-8 rounded-2xl bg-[#FAECF2] p-6"
      >
        <h3 id="trip-summary" className="sr-only">
          여행 요약
        </h3>

        {/* 2열 요약: 장소 / 날짜 */}
        <div className="flex items-start gap-10 divide-x divide-gray-300">
          {/* 장소 */}
          <div className="flex flex-1 flex-col items-center">
            <p className="font-bold">장소</p>
            <p className="text-[36px] font-bold leading-tight">제주도</p>
          </div>

          {/* 날짜 */}
          <div className="flex flex-1 flex-col items-center">
            <p className="font-bold">날짜 및 시간</p>
            <p className="text-[36px] font-bold leading-tight">
              <time dateTime="2025-08-20">2025.08.20</time>
            </p>
            <p className="text-[36px] font-bold leading-tight">
              ~ <time dateTime="2025-08-23">2025.08.23</time>
            </p>
          </div>
        </div>
      </section>

      {/* 일정 관리 */}
      <section aria-labelledby="schedule-heading">
        <header className="mb-4">
          <h2 id="schedule-heading" className="text-[28px] font-bold">
            일정 관리 📆
          </h2>
        </header>

        {/* 날짜 스트립 */}
        <div className="mb-2.5 h-20 w-full rounded-md bg-amber-600 text-white flex items-center px-4">
          <p className="font-medium">날짜 입니다~~</p>
        </div>

        {/* 일정 목록 */}
        <ul className="flex flex-col gap-2" role="list">
          <li>
            <article className="flex items-center gap-2 rounded-[10px] border-2 border-[#F9B5D0] p-3 font-extrabold">
              <img src={dragIcon} className='size-8' />
              <span className="shrink-0 text-2xl text-[#FF8E9E]">1</span>
              <h3 className="font-extrabold">숙소</h3>
            </article>
          </li>

          <li>
            <article className="flex items-center gap-2 rounded-[10px] border-2 border-[#F9B5D0] p-3 font-extrabold">
              <img src={dragIcon} className='size-8' />
              <span className="shrink-0 text-2xl text-[#FF8E9E]">2</span>
              <h3 className="font-extrabold">1일차 점심</h3>
            </article>
          </li>

          <li>
            <article className="flex items-center gap-2 rounded-[10px] border-2 border-[#F9B5D0] p-3 font-extrabold">
              <img src={dragIcon} className='size-8' />
              <span className="shrink-0 text-2xl text-[#FF8E9E]">3</span>
              <h3 className="font-extrabold">
                세 번째 일정입니다. 세 번째 일정입니다.
              </h3>
            </article>
          </li>

          <li>
            <article className="flex items-center gap-2 rounded-[10px] border-2 border-[#F9B5D0] p-3 font-extrabold">
              <img src={dragIcon} className='size-8' />
              <span className="shrink-0 text-2xl text-[#FF8E9E]">4</span>
              <h3 className="font-extrabold">
                세 번째 일정입니다. 세 번째 일정입니다.
              </h3>
            </article>
          </li>

          <li>
            <button
              type="button"
              className="flex w-full items-center justify-center rounded-[10px] bg-[#F9B5D0] p-3 font-extrabold text-white hover:brightness-95 active:brightness-90"
              aria-label="커스텀 일정 추가하기"
            >
              + 커스텀 일정 추가하기
            </button>
          </li>
        </ul>
      </section>
    </section>
  );
}
export default Schedule;
