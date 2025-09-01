import { useGroupStore } from "../store/groupStore"

function TripInfo() {

  const group = useGroupStore((state) => state.group)
  const name = group?.name ?? "로딩 중..."
  const start_day = group?.start_day ?? ""
  const end_day = group?.end_day ?? ""

  return (
    <section className="flex flex-col gap-4">
      <header className="flex">
        <h2 className="text-2 font-bold leading-none">
          우리 그룹의 여행 정보 ✈️
        </h2>
      </header>

      <div className="flex rounded-2xl bg-[#FAECF2] shadow-md px-2">

        <div className="flex w-full divide-x-2 divide-gray-200 di py-4">
          <div className="flex flex-1 flex-col items-center gap-1">
            <p className="font-bold">장소</p>
            <p className="text-2 font-bold leading-tight">{name}</p>
          </div>

          <div className="flex flex-1 flex-col items-center gap-1">
            <p className="font-bold">여행 날짜</p>
            <p className="text-2 font-bold leading-tight whitespace-nowrap pl-1">
              {start_day} ~ {end_day}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
export default TripInfo;
