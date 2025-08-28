import { create } from "zustand";
import { nanoid } from "nanoid";

export type Category = "식비" | "교통비" | "숙박비" | "활동비" | "기타";

export interface Member {
  id: string
  name: string;
}

export interface Expense {
    id: string;
    amount: number;
    category: Category;
    memberId: string;        // 지출자(payer)
    participants: string[];  // 비용을 나눌 대상들(보통 payer 제외 멤버들)
    memo?: string;
    createdAt: string;
  }
  
  interface BudgetState {
    members: Member[];
    expenses: Expense[];
    addExpense: (e: Omit<Expense, "id" | "createdAt">) => void;
    removeExpense: (id: string) => void;
  }
  
  export const useBudgetStore = create<BudgetState>((set) => ({
    members: [
      { id: "u1", name: "user" },
      { id: "u2", name: "user2" },
      { id: "u3", name: "user3" },
    ],
    expenses: [],
    addExpense: (e) =>
      set((s) => ({
        expenses: [{ id: nanoid(), createdAt: new Date().toISOString(), ...e }, ...s.expenses],
      })),
    removeExpense: (id) =>
      set((s) => ({ expenses: s.expenses.filter((x) => x.id !== id) })),
  }));
  