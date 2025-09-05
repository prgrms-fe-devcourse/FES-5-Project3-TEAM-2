import React from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLayoutEffect, useRef, useState } from "react";

import HomeSections from "./components/HomeSections";
import LoginCard from "./components/LoginCard";

import description from "../../assets/description.svg";
import logo from "../../assets/logo.png";
import PlanTravelTogether from "../../assets/Plan. Travel. Together..png";
import title from "../../assets/title.png";
import { FaMapMarkerAlt } from "react-icons/fa";

gsap.registerPlugin(ScrollTrigger);

type Pin = {
  id: number;
  x: number;
  y: number;
};

// 핀 레이어 컴포넌트
const PinLayer = React.memo(({ pins }: { pins: Pin[] }) => {
  return (
    <>
      {pins.map((pin) => (
        <div
          key={pin.id}
          className="absolute w-8 h-8 pointer-events-none z-10 text-red-500"
          style={{
            transform: `translate3d(${pin.x - 10}px, ${pin.y - 20}px, 0)`,
          }}
        >
          <FaMapMarkerAlt className="w-full h-full drop-shadow-lg" />
        </div>
      ))}
    </>
  );
});

const MemoizedHomeSections = React.memo(HomeSections);
const MemoizedLoginCard = React.memo(LoginCard);

export default function Home() {
  const leftRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLImageElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const [pins, setPins] = useState<Pin[]>([]);

  useLayoutEffect(() => {
    document.body.style.cursor = "none";

    // DOM 준비 후 애니메이션 초기화
    const initializeAnimations = () => {
      if (!leftRef.current || !cardRef.current) {
        requestAnimationFrame(initializeAnimations);
        return;
      }

      const ctx = gsap.context(() => {
        gsap.set([leftRef.current, cardRef.current], {
          autoAlpha: 1,
          y: 0,
          x: 0,
        });
        const mm = gsap.matchMedia();
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

      const cursorEl = cursorRef.current;
      let continuousAnimation: gsap.core.Tween | null = null;

      if (cursorEl) {
        gsap.set(cursorEl, {
          x: window.innerWidth / 2,
          y: window.innerHeight / 2,
        });

        const xTo = gsap.quickTo(cursorEl, "x", {
          duration: 0.15,
          ease: "power2.out",
        });
        const yTo = gsap.quickTo(cursorEl, "y", {
          duration: 0.15,
          ease: "power2.out",
        });

        continuousAnimation = gsap.to(cursorEl, {
          scale: 1.2,
          duration: 1,
          repeat: -1,
          yoyo: true,
          ease: "power2.inOut",
        });

        const handleMouseMove = (e: MouseEvent) => {
          xTo(e.clientX - 12);
          yTo(e.clientY - 12);
        };

        const handleMouseDown = (e: MouseEvent) => {
          const newPin = { id: Date.now(), x: e.pageX, y: e.pageY };
          setPins((prev) => [...prev, newPin]);
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mousedown", handleMouseDown);

        // 클린업
        return () => {
          if (continuousAnimation) continuousAnimation.kill();
          window.removeEventListener("mousemove", handleMouseMove);
          window.removeEventListener("mousedown", handleMouseDown);
          ctx.revert();
          document.body.style.cursor = "";
        };
      }

      // 커서가 없을 때의 클린업
      return () => {
        ctx.revert();
        document.body.style.cursor = "";
      };
    };

    // 애니메이션 초기화 시작
    const cleanup = initializeAnimations();

    // useLayoutEffect 클린업에서 실행할 함수 반환
    return cleanup;
  }, []);

  return (
    <>
      <div className="justify-center min-h-dvh grid grid-rows-[1fr_auto] gap-y-8 overflow-x-clip relative">
        {/* 핀 */}
        <PinLayer pins={pins} />

        {/* 커서 */}
        <div
          ref={cursorRef}
          className="fixed w-7 h-7 top-0 left-0 pointer-events-none z-20 text-primary will-change-transform"
        >
          <FaMapMarkerAlt className="w-full h-full" />
        </div>

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
            <MemoizedHomeSections />
          </div>

          <aside
            ref={cardRef}
            className="lg:sticky lg:top-8 self-start h-fit z-15"
          >
            <MemoizedLoginCard />
          </aside>
        </main>
      </div>

      {/* 푸터 */}
      <footer className="row-start-2 w-full border-t border-secondary relative z-0">
        <div className="mx-auto flex flex-wrap max-w-full items-center justify-center gap-6 px-4 py-6 text-sm text-gray-200">
          <p>이용약관</p>
          <p>개인정보처리방침</p>
          <img src={logo} alt="로고" className="w-[104px] h-auto" />
          <p>© 2025 useSleep. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}
