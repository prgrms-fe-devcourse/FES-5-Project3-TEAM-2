import { Fragment } from 'react';

import nature4 from '@/assets/nature4.jpg';
import nature2 from '@/assets/nature2.jpg';
import nature3 from '@/assets/nature3.jpg';

export default function HomeSections() {
    return (
      <section className="w-full px-4 py-16 max-w-[560px]">
        <div className="grid gap-12 md:gap-16">
          <FeatureCard
            title="일정 관리"
            subtitle="여행 일정을 함께 짜고,\n실시간으로 편집하세요."
            img={nature4}
            align="left"
          />
          <FeatureCard
            title="예산 관리"
            subtitle="여행 경비,\n자동 정산으로 투명하게."
            img={nature2}
            align="right"
          />
          <FeatureCard
            title="사진 공유"
            subtitle="여행 순간도\n모두가 함께 즐기는 사진첩."
            img={nature3}
            align="left"
          />
        </div>
      </section>
    );
  }
  
  function FeatureCard({
    title,
    subtitle,
    img,
    align = "left",
  }: {
    title: string;
    subtitle: string;
    img: string;
    align?: "left" | "right";
  }) {
    const alignCls =
      align === "right" ? "md:ml-auto" : ""; // 가운데 그리드에서 좌/우로 배치 느낌
    return (
      <article
        className={`feature-card relative w-full max-w-[400px] ${alignCls}
                    rounded-2xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.12)]`}
      >
        <img
          src={img}
          alt=""
          loading="lazy"
          className="block w-full h-auto object-cover aspect-[16/10] "
        />

        {/* 회색 오버레이 */}
        <div className="absolute inset-0 bg-gray-400/40" />
  
        {/* 좌상단 텍스트 오버레이 */}
        <div className="absolute left-6 top-6">
          <h3 className="text-white text-3xl md:text-4xl font-extrabold leading-tight [text-shadow:0_3px_8px_rgba(0,0,0,0.45)]"
                       >
            {title}
          </h3>
          <p className="mt-3 whitespace-pre-line text-white text-sm md:text-base font-medium  [text-shadow:0_2px_8px_rgba(0,0,0,0.35)]">
            {/* 개행 처리 */}
            {subtitle.split("\\n").map((line, i) => (
              <Fragment key={i}>
                {i > 0 && <br />}
                {line}
                </Fragment>
            ))}
          </p>
        </div>
  
        
      </article>
    );
  }
  
