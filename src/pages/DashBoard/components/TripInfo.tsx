import { useGroupStore } from "../store/groupStore"

function TripInfo() {

  const group = useGroupStore((state) => state.group)
  const name = group?.name ?? "로딩 중..."
  const start_day = group?.start_day ?? ""
  const end_day = group?.end_day ?? ""

  return (
    <section className="flex flex-col gap-6">
      <header className="flex">
        <h2 className="text-3 font-bold leading-none">
          우리 그룹의 여행 정보 ✈️
        </h2>
      </header>

      <div className="flex rounded-2xl bg-[#FAECF2] shadow-md">

        <div className="flex w-full divide-x-2 divide-gray-200 di py-5">
          <div className="flex flex-1 flex-col items-center gap-1">
            <p className="font-bold">장소</p>
            <p className="text-3 font-bold leading-tight">{name}</p>
          </div>

          <div className="flex flex-1 flex-col items-center">
            <p className="font-bold">여행 날짜</p>
            <p className="text-3 font-bold leading-tight">
              <time>{start_day}</time>
            </p>
            <p className="text-3 font-bold leading-tight">
              ~ <time>{end_day}</time>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
export default TripInfo;
