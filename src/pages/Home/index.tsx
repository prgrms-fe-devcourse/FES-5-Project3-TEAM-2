import LoginCard from "./components/LoginCard";
import HomeSections from "./components/HomeSections";

import PlanTravelTogether from "../../assets/Plan. Travel. Together..png";
import title from "../../assets/title.png";
import description from "../../assets/description.svg";
import logo from "../../assets/logo.png";

export default function Home() {
  return (
    <div className="min-h-dvh grid grid-rows-[1fr_auto] gap-y-8">
      {/* 메인 */}
      <main className="row-start-1 mx-auto max-w-[1200px] w-full grid grid-cols-1 md:grid-cols-[minmax(0,640px)_420px] gap-10 px-6 md:px-8 items-start">
        {/* 좌측 콘텐츠 */  }
        <div className="max-w-[640px]">
          <img
            src={PlanTravelTogether}
            alt="Plan Travel Together"
            className="w-[287px] h-auto mt-[120px] "
          />
          <img
            src={title}
            alt="title"
            className="w-[485px] h-auto mt-[20px] mb-[64px]"
          />
          <img
            src={description}
            alt="description"
            className="mt-[20px] "
          />
            <HomeSections />
        </div>

        <aside className="sticky  top-0 self-start h-fit">
          <LoginCard />
        </aside>
      </main>

      {/* 푸터 */}
      <footer className="row-start-2 w-full border-t border-secondary relative z-0">
        <div className="mx-auto flex max-w-6xl items-center justify-center gap-6 py-6 text-sm text-gray-200">
          <p>이용약관</p>
          <p>개인정보처리방침</p>
          <img src={logo} alt="로고" className="w-[104px] h-auto" />
          <p>© 2025 useSleep. All rights reserved.</p>
        </div>
      </footer>
      </div>
  );
}