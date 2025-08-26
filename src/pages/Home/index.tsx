import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import LoginCard from "./components/LoginCard";
import HomeSections from "./components/HomeSections";

import PlanTravelTogether from "../../assets/Plan. Travel. Together..png";
import title from "../../assets/title.png";
import description from "../../assets/description.svg";
import logo from "../../assets/logo.png";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const leftRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLImageElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set([leftRef.current, cardRef.current], { autoAlpha : 1, y: 0, x: 0});
      });
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // 1) 첫 진입 : 타임라인으로 순차 등장
        const tl = gsap.timeline({defaults: {ease: "power3.out", duration : 0.7}});
        tl.from(leftRef.current, {y: 16, autoAlpha : 0})
          .from(cardRef.current, {x: 24, autoAlpha : 0}, "-=0.45"); // 약간 겹치게

        // 2) 히어로 약한 패럴랙스(스크럽)
        if(heroRef.current) {
          gsap.to(heroRef.current, {
            y: -12,
            ease: "none",
            scrollTrigger: {
              trigger: leftRef.current,
              start: "top top",
              end: "bottom top",
              scrub: 0.35,
            },
          });
        }

        // 3) 섹션 카드들 : 한 장씩 자연스럽게
        gsap.utils.toArray<HTMLElement>(".feature-card").forEach((el) => {
          gsap.fromTo(
            el,
            {y: 18, autoAlpa: 0},
            {
              y: 0,
              autoAlpha: 1,
              duration: 0.55,
              ease: "power2.out",
              force3D: true,
              scrollTrigger: {
                trigger: el,
                start: "top 82%",
                toggleActions: "play none none reverse",
                once: true,
              }
            }
          )
    })
  });
  })
    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-dvh grid grid-rows-[1fr_auto] gap-y-8">
      {/* 메인 */}
      <main className="row-start-1 mx-auto max-w-[1200px] w-full grid grid-cols-1 md:grid-cols-[minmax(0,640px)_420px] gap-10 px-6 md:px-8 items-start">
        {/* 좌측 콘텐츠 */  }
        <div ref={leftRef} className="max-w-[640px]">
          <img
            ref={heroRef}
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

        <aside ref={cardRef} className="sticky  top-0 self-start h-fit">
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