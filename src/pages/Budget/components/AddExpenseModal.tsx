import { useBudgetStore, type Category } from "@/store/budgetStore";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";
import { insertExpenseWithShares, koToEnumCategory } from "@/pages/Budget/api/expenses";

export default function AddExpenseModal({ onClose }: { onClose: () => void }) {
  const members = useBudgetStore((s) => s.members);
  const addExpense = useBudgetStore((s) => s.addExpense);
  const { groupId } = useParams<{ groupId: string }>();

  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<Category>("식비");
  const [memberId, setMemberId] = useState(members[0]?.id ?? ""); // payer
  const [participants, setParticipants] = useState<string[]>([]);  // split 대상
  const [memo, setMemo] = useState("");

  // payer를 제외한 기본 참여자 목록
  const others = useMemo(() => members.filter((m) => m.id !== memberId), [members, memberId]);

  // payer 바뀌면 기본값: "payer를 제외한 전원"으로 재설정
  useEffect(() => {
    setParticipants(others.map((m) => m.id));
  }, [others]);

  const toggle = (id: string) =>
    setParticipants((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const allChecked = participants.length === others.length && others.length > 0;
  const toggleAll = () =>
    setParticipants(allChecked ? [] : others.map((m) => m.id));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const a = Number(amount.replace(/[^0-9]/g, ""));
    if (!a) return alert("금액을 입력해 주세요.");
    if (!memberId) return alert("지출자를 선택해 주세요.");
    if ((participants?.length ?? 0) === 0) return alert("참여자를 한 명 이상 선택해 주세요.");
    if (!groupId) return alert("그룹 정보가 없습니다.");

    try {
      // 1) Supabase 저장
      await insertExpenseWithShares({
        groupId,
        description: memo || `${category} 지출`,
        totalAmount: a,
        expenseTime: new Date().toISOString().slice(0, 10),
        category: koToEnumCategory[category],
        payerId: memberId,
        participantIds: participants,
      });

      // 2) 로컬 스토어 업데이트 (UI 즉시 반영)
      addExpense({
        amount: a,
        category,
        memberId,
        participants,
        memo,
      });
      onClose();
    } catch (err) {
      console.error(err);
      alert("저장 중 오류가 발생했습니다. 다시 시도해 주세요.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} aria-hidden />
      <form onSubmit={submit} className="relative w-[460px] rounded-xl bg-white p-5 shadow-xl">
        <h3 className="mb-4 text-lg font-bold">경비 추가</h3>

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
              <input
                type="checkbox"
                checked={allChecked}
                onChange={toggleAll}
                className="accent-rose-400"
              />
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
            {others.length === 0 && (
              <div className="text-xs text-slate-500 col-span-2">함께 나눌 사람이 없습니다.</div>
            )}
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

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-lg border px-4 py-2">
            취소
          </button>
          <button type="submit" className="rounded-lg bg-primary px-4 py-2 font-semibold text-white">
            추가
          </button>
        </div>
      </form>
    </div>
  );
}
