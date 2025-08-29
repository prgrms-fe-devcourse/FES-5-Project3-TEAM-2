import { create } from "zustand";
import { nanoid } from "nanoid";

export type Category = "식비" | "교통비" | "숙박비" | "활동비" | "기타";

export interface Member {
  id: string; // profile.id
  name: string; // profile.name
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
  
  export interface ExpenseShare {
    expenseId: string;
    userId: string;
    amount: number;
  }
  
  interface BudgetState {
    members: Member[];
    expenses: Expense[];
    shares: ExpenseShare[];
    setMembers: (ms: Member[]) => void;
    setExpenses: (es: Expense[]) => void;
    setShares: (ss: ExpenseShare[]) => void;
    addShares: (ss: ExpenseShare[]) => void;
    addExpense: (e: Omit<Expense, "id" | "createdAt">) => void;
    removeExpense: (id: string) => void;
  }
  
  export const useBudgetStore = create<BudgetState>((set) => ({
    members: [],
    expenses: [],
    shares: [],
    setMembers: (ms) => set({ members: ms }),
    setExpenses: (es) => set({ expenses: es }),
    setShares: (ss) => set({ shares: ss }),
    addShares: (ss) => set((s) => ({ shares: [...s.shares, ...ss] })),
    addExpense: (e) =>
      set((s) => ({
        expenses: [{ id: nanoid(), createdAt: new Date().toISOString(), ...e }, ...s.expenses],
      })),
    removeExpense: (id) =>
      set((s) => ({ expenses: s.expenses.filter((x) => x.id !== id) })),
  }));
  
