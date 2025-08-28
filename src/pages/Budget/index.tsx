import Button from "@/components/common/Button";
import BudgetStatsCard from "./components/BudgetStatsCard";

import CardIcon from "@/assets/icons/card.svg?react"

const chartData = [
  { name: "식비", value: 2000000, colors: "primary" },
  { name: "교통비", value: 1400000, colors: "secondary" },
  { name: "기타", value: 600000, colors: "tertiary" },
];

export default function BudgetPage() {
  return (
    <>
      <div className="flex justify-between mb-[20px]">
        <div className="flex gap-[20px]">
          <Button variant="secondary">전체</Button>
          <Button variant="secondary">식비</Button>
          <Button variant="secondary">교통비</Button>
          <Button variant="secondary">숙박비</Button>
          <Button variant="secondary">활동비</Button>
          <Button variant="secondary">기타</Button>
        </div>
        <Button variant="secondary" startIcon={<CardIcon className="w-4 h-4" />}>
            경비 추가
        </Button>
      </div>
      <div className="flex h-full gap-[20px]">
        {/* 좌측: 리스트/정산 등 */}
        <div className="flex-1 rounded-2xl border border-secondary bg-white shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-6">
          <h3 className="text-2xl font-extrabold">전체 지출 내역 📄</h3>
        </div>

        <div className="flex-1 rounded-2xl border border-secondary bg-white shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-6">
          <h3 className="text-2xl font-extrabold">개인 정산 💵</h3>
        </div>

        {/* 우측: 통계 카드 */}
        <div className="flex-1">
          <BudgetStatsCard data={chartData} />
        </div>
      </div>
    </>
  );
}
