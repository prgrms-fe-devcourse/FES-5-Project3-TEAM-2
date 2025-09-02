import { useBudgetStore } from "@/store/budgetStore";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";
import { getGroupMembers } from "@/pages/Group/api/getGroupMembers";

import DefaultProfile from "@/assets/default-profile.png";

const fmt = (n: number) => n.toLocaleString() + "원";

export default function SettlementPanel() {
  const members = useBudgetStore((s) => s.members);
  const expenses = useBudgetStore((s) => s.expenses);
  const shares = useBudgetStore((s) => s.shares);
  const { groupId } = useParams<{ groupId: string }>();

  // userId -> avatar_url 매핑
  const [avatars, setAvatars] = useState<Record<string, string | null>>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!groupId) return;
      try {
        const rows = await getGroupMembers(groupId);
        if (cancelled) return;
        const map: Record<string, string | null> = {};
        rows.forEach((r) => {
          map[r.user_id] = r.avatar_url ?? null;
        });
        setAvatars(map);
      } catch (e) {
        // 실패해도 기본 이미지로 표시
        console.error("멤버 아바타 불러오기 실패", e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [groupId]);

  // 반환: { owe: 내가 내야 할 돈, receive: 내가 받아야 할 돈 }
  const { owe, receive } = useMemo(() => {
    const oweMap: Record<string, number> = {};
    const recvMap: Record<string, number> = {};
    members.forEach((m) => {
      oweMap[m.id] = 0;
      recvMap[m.id] = 0;
    });

    if (shares.length > 0) {
      // owes: expenseshares의 user_id 합계
      shares.forEach((s) => {
        oweMap[s.userId] = (oweMap[s.userId] || 0) + s.amount;
      });
      // receive: 각 expense의 payer에게 해당 expense로 생성된 shares 합산
      const sharesByExpense: Record<string, number> = {};
      shares.forEach((s) => {
        sharesByExpense[s.expenseId] = (sharesByExpense[s.expenseId] || 0) + s.amount;
      });
      expenses.forEach((e) => {
        const amt = sharesByExpense[e.id] || 0;
        if (e.memberId) recvMap[e.memberId] = (recvMap[e.memberId] || 0) + amt;
      });
      return { owe: oweMap, receive: recvMap };
    }

    // Fallback: 로컬 계산 (서버 share 없을 때)
    expenses.forEach((e) => {
      const rawTargets =
        e.participants ??
        members.map((m) => m.id).filter((id) => id !== e.memberId);
      const allForSplit = new Set<string>([...rawTargets, e.memberId]);
      const n = allForSplit.size;
      if (n === 0) return;
      const share = e.amount / n;
      // 참가자(지출자 제외)는 owe, 지출자는 receive
      rawTargets
        .filter((id) => id !== e.memberId)
        .forEach((id) => {
          oweMap[id] = (oweMap[id] || 0) + share;
          if (e.memberId) recvMap[e.memberId] = (recvMap[e.memberId] || 0) + share;
        });
    });

    return { owe: oweMap, receive: recvMap };
  }, [members, expenses, shares]);

  return (
    <div className="space-y-3">
      {members.map((m) => {
        const toPay = owe[m.id] ?? 0;
        const toReceive = receive[m.id] ?? 0;
        return (
          <div
            key={m.id}
            className="flex items-center justify-between rounded-xl bg-[#FEF0F6] px-4 py-3"
          >
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-full bg-slate-200 overflow-hidden">
                <img
                  src={avatars[m.id] || DefaultProfile}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = DefaultProfile as unknown as string;
                  }}
                  alt="프로필 이미지"
                  className="w-8 h-8 object-cover rounded-full"
                />
              </div>
              <div className="text-sm">{m.name}</div>
            </div>
            <div className="text-right text-xs leading-tight">
              <div>받을 돈: <span className="font-semibold">{fmt(toReceive)}</span></div>
              <div>낼 돈: <span className="font-semibold">{fmt(toPay)}</span></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
