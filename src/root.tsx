import { Outlet } from "react-router";


export default function Root() {
  return (
    <div>

      {/* 왼쪽 사이드 바 */}

      {/* 메인 컨텐츠 */}
      <main className="m-4">
            <Outlet></Outlet> {/* Home, Dashboard 등 페이지가 여기 들어옴 */}
        </main>

    </div>
  )
}
