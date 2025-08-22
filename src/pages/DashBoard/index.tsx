import Map from "../DashBoard/components/Map"
import Schedule from "../DashBoard/components/Schedule"

function DashBoard() {
  return (
    // 컨테이너
    <div className="bg-[#FAFAFA] w-full h-full border-2 border-black flex flex-row">
      {/* // 일정 블록 섹션 */}
      <Schedule />

      {/* // 지도 섹션 */}
      <Map />


    </div>
  )
}
export default DashBoard
