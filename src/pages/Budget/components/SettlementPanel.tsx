import { useBudgetStore } from "@/store/budgetStore";
import { useMemo } from "react";

import DefaultProfile from "@/assets/default-profile.png";

const fmt = (n: number) => n.toLocaleString() + "원";

export default function SettlementPanel() {
  const members = useBudgetStore((s) => s.members);
  const expenses = useBudgetStore((s) => s.expenses);

  // 참여자 + 지출자 = 분배 인원
  // 각 share = amount / (참여자 ∪ 지출자)의 인원수
  // 실제 '내야 하는 금액(dues)'은 지출자 제외 대상에게만 share 누적
  const dues = useMemo(() => {
    const map: Record<string, number> = {};
    members.forEach((m) => (map[m.id] = 0));

    expenses.forEach((e) => {
      // 저장된 participants가 없다면 기본: '전체 멤버 - 지출자'
      const rawTargets =
        e.participants ??
        members.map((m) => m.id).filter((id) => id !== e.memberId);

      // 분배 인원 = (참여자 ∪ 지출자)
      const allForSplit = new Set<string>([...rawTargets, e.memberId]);
      const n = allForSplit.size; // ← 분모에 지출자 포함
      if (n === 0) return;

      const share = e.amount / n;

      // 실제 납부 대상 = 참여자 중에서 지출자 제외
      rawTargets
        .filter((id) => id !== e.memberId)
        .forEach((id) => {
          map[id] += share;
        });
    });

    return map; // { memberId: 내야 할 총액 }
  }, [members, expenses]);

  return (
    <div className="space-y-3">
      {members.map((m) => {
        const due = dues[m.id] ?? 0;
        return (
          <div
            key={m.id}
            className="flex items-center justify-between rounded-xl bg-[#FEF0F6] px-4 py-3"
          >
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-full bg-slate-200">
                <img src={DefaultProfile} alt="기본 프로필 이미지" />
              </div>
              <div className="text-sm">{m.name}</div>
            </div>
            <div className="text-right text-sm">
              <div className="font-semibold">{fmt(due)}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
