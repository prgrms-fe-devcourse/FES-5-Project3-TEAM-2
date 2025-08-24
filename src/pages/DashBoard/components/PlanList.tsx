import dragIcon from '@/assets/icons/drag_indicator_icon.png'
import deleteIcon from '@/assets/icons/delete_icon.png'
import editIcon from '@/assets/icons/edit_icon.png'
import TripDays from './TripDays'



const planItems = [
  { index: 1, content: "수영하기", hour: 3 },
  { index: 2, content: "왕십리 곱창 먹기", hour: 2 },
  { index: 3, content: "제 1회 성대모사 대회", hour: 1 },
  { index: 4, content: "카페에서 브런치", hour: 2 },
  { index: 5, content: "한강 자전거 타기", hour: 3 },
  { index: 6, content: "노을 산책", hour: 1 },
  { index: 7, content: "보드게임 대회", hour: 2 },
  { index: 8, content: "사진 촬영 타임", hour: 1 },
  { index: 9, content: "야시장 먹거리 투어", hour: 2 },
  { index: 10, content: "노래방 가기", hour: 2 },
  { index: 11, content: "스파·찜질방", hour: 3 },
  { index: 12, content: "카트 체험", hour: 1 },
  { index: 13, content: "캠프파이어", hour: 2 },
  { index: 14, content: "새벽 드라이브", hour: 2 },
  { index: 15, content: "기념품 쇼핑", hour: 1 },
  { index: 16, content: "단체 사진 촬영", hour: 1 },
  { index: 17, content: "해변 모래성 쌓기", hour: 2 },
  { index: 18, content: "숙소 체크인", hour: 1 },
  { index: 19, content: "숙소 체크아웃", hour: 1 },
  { index: 20, content: "사진·영상 정리 및 회고", hour: 2 },
];



function PlanList() {

  return (
    <section className="">
      <header>
        <h2 className="text-[28px] font-bold">일정 관리 📆</h2>
      </header>

      <div className='flex flex-col gap-6'>
        <TripDays />

        <ul className="flex flex-col gap-2 h-[350px] overflow-auto -mr-4" role="list">

          {
            planItems.map(({ index, content, hour }) => (
              <li key={index}>
                <article className="h-[60px] pr-2 flex items-center gap-2 rounded-[10px] border-2 border-secondary font-extrabold">
                  <img src={dragIcon} className='size-10 cursor-pointer' />
                  <span className="shrink-0 text-2xl text-primary">{index}</span>
                  <p className="font-extrabold">{content}</p>

                  <div className="ml-auto flex items-center gap-2">
                    <p className='text-lg text-primary'>{hour}시간</p>
                    <img src={editIcon} className='size-6 cursor-pointer'/>
                    <img src={deleteIcon} className='size-6 cursor-pointer' />
                  </div>
                </article>
              </li>
            ))
          }

          <li>
            <button
              type="button"
              className="h-[60px] flex w-full items-center justify-center rounded-[10px] bg-secondary font-extrabold text-white hover:brightness-95 active:brightness-90"
            >
              + 커스텀 일정 추가하기
            </button>
          </li>
        </ul>
      </div>
    </section>
  )
}
export default PlanList