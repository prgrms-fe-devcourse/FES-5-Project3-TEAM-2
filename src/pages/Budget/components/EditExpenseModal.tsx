import { useBudgetStore, type Category, type Expense, type ExpenseShare } from "@/store/budgetStore";
import { useEffect, useMemo, useState } from "react";
import { koToEnumCategory, updateExpenseWithShares, deleteExpense } from "@/pages/Budget/api/expenses";

export default function EditExpenseModal({ expense, onClose }: { expense: Expense; onClose: () => void }) {
  const members = useBudgetStore((s) => s.members);
  const updateExpenseStore = useBudgetStore((s) => s.updateExpense);
  const replaceSharesForExpense = useBudgetStore((s) => s.replaceSharesForExpense);
  const removeSharesByExpense = useBudgetStore((s) => s.removeSharesByExpense);
  const removeExpense = useBudgetStore((s) => s.removeExpense);
  const allShares = useBudgetStore((s) => s.shares);

  const [amount, setAmount] = useState(() => expense.amount.toLocaleString());
  const [category, setCategory] = useState<Category>(expense.category);
  const [memberId, setMemberId] = useState(expense.memberId); // payer
  const [participants, setParticipants] = useState<string[]>(expense.participants || []); // split 대상
  const [memo, setMemo] = useState(expense.memo || "");

  // payer를 제외한 기본 참여자 목록
  const others = useMemo(() => members.filter((m) => m.id !== memberId), [members, memberId]);

  // payer 바뀌면 기본값: "payer를 제외한 전원"으로 재설정
  useEffect(() => {
    setParticipants((prev) => {
      // 유지 가능한 기존 선택을 유지하고, 기본은 전체 선택
      const base = new Set(others.map((m) => m.id));
      const kept = prev.filter((id) => base.has(id));
      return kept.length > 0 ? kept : others.map((m) => m.id);
    });
  }, [others]);

  const toggle = (id: string) =>
    setParticipants((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const allChecked = participants.length === others.length && others.length > 0;
  const toggleAll = () => setParticipants(allChecked ? [] : others.map((m) => m.id));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const a = Number(String(amount).replace(/[^0-9]/g, ""));
    if (!a || !memberId || (participants?.length ?? 0) === 0) return;

    const prevExpense: Expense = { ...expense };
    const prevShares: ExpenseShare[] = allShares.filter((s) => s.expenseId === expense.id);

    try {
      const allForSplit = new Set<string>([...participants, memberId]);
      const n = allForSplit.size || 1;
      const share = a / n;
      const newShares: ExpenseShare[] = participants
        .filter((id) => id !== memberId)
        .map((uid) => ({ expenseId: expense.id, userId: uid, amount: share }));

      // 낙관적 업데이트
      updateExpenseStore(expense.id, { amount: a, category, memberId, participants, memo });
      replaceSharesForExpense(expense.id, newShares);

      await updateExpenseWithShares({
        expenseId: expense.id,
        description: memo || `${category} 지출`,
        totalAmount: a,
        expenseTime: expense.createdAt,
        category: koToEnumCategory[category],
        payerId: memberId,
        participantIds: participants,
      });
      onClose();
    } catch (err) {
      // 롤백
      updateExpenseStore(expense.id, {
        amount: prevExpense.amount,
        category: prevExpense.category,
        memberId: prevExpense.memberId,
        participants: prevExpense.participants,
        memo: prevExpense.memo,
      });
      replaceSharesForExpense(expense.id, prevShares);
      alert("수정 중 오류가 발생했습니다. 다시 시도해 주세요.");
    }
  };

  const onDelete = async () => {
    if (!confirm("정말 삭제하시겠어요? 이 작업은 되돌릴 수 없습니다.")) return;
    try {
      await deleteExpense(expense.id);
      removeSharesByExpense(expense.id);
      removeExpense(expense.id);
      onClose();
    } catch (err) {
      alert("삭제 중 오류가 발생했습니다. 다시 시도해 주세요.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} aria-hidden />
      <form onSubmit={onSubmit} className="relative w-[460px] rounded-xl bg-white p-5 shadow-xl">
        <h3 className="mb-4 text-lg font-bold">경비 수정</h3>

        {/* 금액 */}
        <label className="mb-3 block text-sm font-medium">
          금액(원)
          <input
            type="text"
            inputMode="numeric"
            value={amount}
            onChange={(e) =>
              setAmount(
                e.target.value.replace(/[^0-9]/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              )
            }
            className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-rose-300"
            placeholder="예: 120,000"
          />
        </label>

        {/* 카테고리 */}
        <label className="mb-3 block text-sm font-medium">
          카테고리
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2"
          >
            {["식비", "교통비", "숙박비", "활동비", "기타"].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        {/* 지출자 */}
        <label className="mb-3 block text-sm font-medium">
          지출자
          <select
            value={memberId}
            onChange={(e) => setMemberId(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2"
          >
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </label>

        {/* 참여자 (체크박스) */}
        <div className="mb-4">
          <div className="mb-1 text-sm font-medium">참여자 (지출자 제외)</div>
          <div className="mb-2">
            <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={allChecked} onChange={toggleAll} className="accent-rose-400" />
              전체 선택/해제
            </label>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {others.map((m) => (
              <label key={m.id} className="inline-flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={participants.includes(m.id)}
                  onChange={() => toggle(m.id)}
                  className="accent-rose-400"
                />
                {m.name}
              </label>
            ))}
            {others.length === 0 && <div className="text-xs text-slate-500 col-span-2">함께 나눌 사람이 없습니다.</div>}
          </div>
        </div>

        {/* 메모 */}
        <label className="mb-4 block text-sm font-medium">
          메모(선택)
          <input
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2"
            placeholder="예: 첫날 저녁식사"
          />
        </label>

        <div className="flex justify-between gap-2">
          <button type="button" onClick={onDelete} className="rounded-lg border px-4 py-2 text-red-600 border-red-300">
            삭제
          </button>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="rounded-lg border px-4 py-2">
              취소
            </button>
            <button type="submit" className="rounded-lg bg-primary px-4 py-2 font-semibold text-white">
              저장
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

