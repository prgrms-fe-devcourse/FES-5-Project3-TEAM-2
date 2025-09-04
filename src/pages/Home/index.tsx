import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLayoutEffect, useRef } from "react";

import HomeSections from "./components/HomeSections";
import LoginCard from "./components/LoginCard";

import description from "../../assets/description.svg";
import logo from "../../assets/logo.png";
import PlanTravelTogether from "../../assets/Plan. Travel. Together..png";
import title from "../../assets/title.png";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const leftRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLImageElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set([leftRef.current, cardRef.current], {
          autoAlpha: 1,
          y: 0,
          x: 0,
        });
      });
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // 1) 첫 진입: 더 강한 등장감
        const tl = gsap.timeline({
          defaults: { ease: "power4.out", duration: 0.9 },
        });
        tl.from(leftRef.current, { y: 40, autoAlpha: 0 }).from(
          cardRef.current,
          { x: 48, autoAlpha: 0, scale: 0.98 },
          "-=0.4",
        );

        // 2) 히어로 패럴랙스 강도 증가
        if (heroRef.current) {
          gsap.to(heroRef.current, {
            y: -40,
            ease: "none",
            scrollTrigger: {
              trigger: leftRef.current,
              start: "top top",
              end: "bottom top",
              scrub: 0.6,
            },
          });
        }

        // 3) 섹션 카드: 더 큰 이동/페이드로 등장
        gsap.utils.toArray<HTMLElement>(".feature-card").forEach((el) => {
          gsap.fromTo(
            el,
            { y: 36, autoAlpha: 0 },
            {
              y: 0,
              autoAlpha: 1,
              duration: 0.7,
              ease: "power3.out",
              force3D: true,
              scrollTrigger: {
                trigger: el,
                start: "top 90%",
                toggleActions: "play none none reverse",
                once: true,
              },
            },
          );
        });
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <div className="justify-center min-h-dvh grid grid-rows-[1fr_auto] gap-y-8 overflow-x-clip">
      {/* 메인 */}
      <main className="row-start-1 mx-auto max-w-[1200px] w-full grid grid-cols-1 lg:grid-cols-[minmax(0,560px)_360px] xl:grid-cols-[minmax(0,640px)_420px] gap-20 px-6 md:px-8 items-start">
        {/* 좌측 콘텐츠 */}
        <div ref={leftRef} className="w-full max-w-[640px]">
          <img
            ref={heroRef}
            src={PlanTravelTogether}
            alt="Plan Travel Together"
            className="w-full max-w-[287px] h-auto mt-12 md:mt-[120px]"
          />
          <img
            src={title}
            alt="title"
            className="w-full max-w-[485px] h-auto mt-5 mb-10 md:mb-16"
          />
          <img
            src={description}
            alt="description"
            className="mt-5 w-full max-w-full h-auto"
          />
          <HomeSections />
        </div>

        <aside ref={cardRef} className="lg:sticky lg:top-8 self-start h-fit">
          <LoginCard />
        </aside>
      </main>

      {/* 푸터 */}
      <footer className="row-start-2 w-full border-t border-secondary relative z-0">
        <div className="mx-auto flex flex-wrap max-w-6xl items-center justify-center gap-6 px-4 py-6 text-sm text-gray-200">
          <p>이용약관</p>
          <p>개인정보처리방침</p>
          <img src={logo} alt="로고" className="w-[104px] h-auto" />
          <p>© 2025 useSleep. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
