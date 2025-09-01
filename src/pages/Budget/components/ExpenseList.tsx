import { useBudgetStore, type Expense } from "@/store/budgetStore";
import { useMemo, useState } from "react";
import EditExpenseModal from "@/pages/Budget/components/EditExpenseModal";

const fmt = (n: number) => n.toLocaleString() + "원";

export default function ExpenseList({ items }: { items?: Expense[] }) {
  const sourceExpenses = useBudgetStore((s) => s.expenses); // 원본(기본값)
  const expenses = items ?? sourceExpenses; // 외부에서 전달되면 그걸 사용
  const members = useBudgetStore((s) => s.members);
  const [editing, setEditing] = useState<Expense | null>(null);

  const sorted = useMemo(
    () =>
      [...expenses].sort(
        (a, b) => +new Date(a.createdAt) - +new Date(b.createdAt),
      ),
    [expenses],
  );

  const findName = (id: string) =>
    members.find((m) => m.id === id)?.name ?? "-";

  if (sorted.length === 0)
    return (
      <div className="h-[520px] grid place-items-center text-slate-400">
        아직 기록이 없어요.
      </div>
    );

  return (
    <>
      <ul className="divide-y divide-slate-100 flex-1 min-h-0 overflow-auto mt-0 ">
        {sorted.map((e, i) => (
          <li
            key={e.id}
            className="flex items-center justify-between py-3 cursor-pointer hover:bg-slate-50 px-2 rounded-md"
            onClick={() => setEditing(e)}
          >
            <div className="flex items-center gap-3">
              <span className="text-slate-400 w-6">{i + 1}</span>
              <div>
                <div className="font-medium">
                  {e.memo || `${e.category} 지출`}
                </div>
                <div className="text-xs text-gray-400">
                  {new Date(e.createdAt).toLocaleDateString()} | {e.category} |{" "}
                  {findName(e.memberId)}
                </div>
              </div>
            </div>
            <div className="text-right font-semibold">{fmt(e.amount)}</div>
          </li>
        ))}
      </ul>
      {editing && (
        <EditExpenseModal expense={editing} onClose={() => setEditing(null)} />
      )}
    </>
  );
}
