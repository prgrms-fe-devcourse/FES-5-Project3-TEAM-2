import AddExpenseButton from "@/pages/Budget/components/AddExpenseButton";
import ExpenseList from "@/pages/Budget/components/ExpenseList";
import SettlementPanel from "@/pages/Budget/components/SettlementPanel";
import BudgetStatsCard from "@/pages/Budget/components/BudgetStatsCard";
import { useBudgetStore, type Category } from "@/store/budgetStore";
import { useEffect } from "react";
import { useParams } from "react-router";
import {
  fetchGroupMembers,
  fetchExpensesAndShares,
} from "@/pages/Budget/api/expenses";
import { useMemo, useState } from "react";
import Button from "@/components/common/Button";

export default function BudgetPage() {
  const expenses = useBudgetStore((s) => s.expenses);
  const setMembers = useBudgetStore((s) => s.setMembers);
  const setExpensesStore = useBudgetStore((s) => s.setExpenses);
  const setSharesStore = useBudgetStore((s) => s.setShares);
  const { groupId } = useParams<{ groupId: string }>();
  const [selected, setSelected] = useState<Category | "전체">("전체");

  const filteredExpenses = useMemo(
    () =>
      selected === "전체"
        ? expenses
        : expenses.filter((e) => e.category === selected),
    [expenses, selected],
  );

  const dataForChart = useMemo(() => {
    const acc: Record<string, number> = {
      식비: 0,
      교통비: 0,
      숙박비: 0,
      활동비: 0,
      기타: 0,
    };
    expenses.forEach(
      (e) => (acc[e.category] = (acc[e.category] || 0) + e.amount),
    );
    return [
      { name: "식비", value: acc["식비"], color: "#FF8E9E" },
      { name: "교통비", value: acc["교통비"], color: "#F9B8C4" },
      { name: "숙박비", value: acc["숙박비"], color: "#FFD1DC" },
      { name: "활동비", value: acc["활동비"], color: "#FBD3E9" },
      { name: "기타", value: acc["기타"], color: "#7EC8E3" },
    ];
  }, [expenses]);

  useEffect(() => {
    (async () => {
      if (!groupId) return;
      try {
        const ms = await fetchGroupMembers(groupId);
        setMembers(ms);
      } catch (e) {
        console.error("그룹 멤버 불러오기 실패", e);
      }
    })();
  }, [groupId, setMembers]);

  // Load existing expenses and shares for this group
  useEffect(() => {
    (async () => {
      if (!groupId) return;
      try {
        const { expenses: es, shares: ss } =
          await fetchExpensesAndShares(groupId);
        setExpensesStore(es);
        setSharesStore(ss);
      } catch (e) {
        console.error("경비 불러오기 실패", e);
      }
    })();
  }, [groupId, setExpensesStore, setSharesStore]);

  return (
    <div className="h-full overflow-hidden grid grid-rows-[auto_1fr] gap-y-4 px-6 py-4">
      {/* 상단바 */}
      <div className="flex flex-wrap items-center justify-between gap-2 md:gap-3">
        <div className="flex gap-2">
          {(
            ["전체", "식비", "교통비", "숙박비", "활동비", "기타"] as const
          ).map((c) => (
            <Button
              key={c}
              variant={selected === c ? "primary" : "secondary"}
              onClick={() => setSelected(c)}
            >
              {c}
            </Button>
          ))}
        </div>
        <div className="ml-auto">
          <AddExpenseButton />
        </div>
      </div>

      {/* 콘텐츠: 남은 높이 100% 사용, 내부 스크롤만 허용 */}
      <div className="min-h-0 overflow-hidden grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_420px] gap-6">
        {/* 전체 지출 내역 */}
        <section className="flex min-h-0 flex-col rounded-2xl border border-secondary bg-white shadow-[0_4px_16px_rgba(0,0,0,0.06)]">
          <header className="shrink-0 sticky top-0 z-10 bg-white px-5 py-4 rounded-t-2xl">
            <h3 className="text-xl font-extrabold">전체 지출 내역 📄</h3>
          </header>
          <div className="flex-1 min-h-0 overflow-auto px-5">
            <ExpenseList items={filteredExpenses} />
          </div>
        </section>

        {/* 개인 정산 */}
        <section className="flex min-h-0 flex-col rounded-2xl border border-secondary bg-white shadow-[0_4px_16px_rgba(0,0,0,0.06)]">
          <header className="shrink-0 sticky top-0 z-10 bg-white px-5 py-4 rounded-t-2xl">
            <h3 className="text-xl font-extrabold">개인 정산 💵</h3>
          </header>
          <div className="flex-1 min-h-0 overflow-auto px-5 py-4">
            <SettlementPanel />
          </div>
        </section>

        {/* 통계 */}
        <BudgetStatsCard
          title="통계 📊"
          totalLabel="총 지출 내역"
          data={dataForChart}
        />
      </div>
    </div>
  );
}
