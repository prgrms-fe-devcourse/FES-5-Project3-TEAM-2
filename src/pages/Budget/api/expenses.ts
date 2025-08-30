import { supabase } from "@/lib/supabaseClient";
import type { Tables, TablesInsert, Enums } from "@/types/supabase";
import type { Expense, ExpenseShare } from "@/store/budgetStore";

export type ExpenseCategoryEnum = Enums<"expense_category">; // "food" | "transport" | ...

export const koToEnumCategory: Record<string, ExpenseCategoryEnum> = {
  "식비": "food",
  "교통비": "transport",
  "숙박비": "hotel",
  "활동비": "activity",
  "기타": "other",
};

export const enumToKoCategory: Record<ExpenseCategoryEnum, import("@/store/budgetStore").Category> = {
  food: "식비",
  transport: "교통비",
  hotel: "숙박비",
  activity: "활동비",
  other: "기타",
};

export async function fetchGroupMembers(groupId: string) {
  const { data, error } = await supabase
    .from("groupmembers")
    .select("user_id, profile:profile(id, name)")
    .eq("group_id", groupId);

  if (error) throw error;

  return (data ?? []).map((row) => ({ id: row.profile!.id, name: row.profile!.name }));
}

export interface InsertExpenseParams {
  groupId: string;
  description: string; // memo
  totalAmount: number;
  expenseTime: string; // ISO or YYYY-MM-DD
  category: ExpenseCategoryEnum;
  payerId: string; // profile.id
  participantIds: string[]; // profile.id[] (may or may not include payer)
}

export async function insertExpenseWithShares(p: InsertExpenseParams) {
  const expense: TablesInsert<"expenses"> = {
    group_id: p.groupId,
    description: p.description,
    total_amount: p.totalAmount,
    expense_time: p.expenseTime,
    category: p.category,
    payer_id: p.payerId,
  };

  const { data: created, error: eErr } = await supabase
    .from("expenses")
    .insert(expense)
    .select()
    .maybeSingle();

  if (eErr) throw eErr;
  if (!created) throw new Error("Failed to insert expense");

  const allForSplit = new Set<string>([...p.participantIds, p.payerId]);
  const n = allForSplit.size || 1;
  const share = p.totalAmount / n;

  const rows: TablesInsert<"expenseshares">[] = p.participantIds
    .filter((id) => id !== p.payerId)
    .map((uid) => ({ expense_id: created.id, user_id: uid, amount: share }));

  if (rows.length > 0) {
    const { error: sErr } = await supabase.from("expenseshares").insert(rows);
    if (sErr) throw sErr;
  }

  return created;
}

export async function fetchExpensesAndShares(groupId: string): Promise<{
  expenses: Expense[];
  shares: ExpenseShare[];
}> {
  const { data: exps, error: eErr } = await supabase
    .from("expenses")
    .select("id, description, total_amount, expense_time, category, payer_id")
    .eq("group_id", groupId)
    .order("expense_time", { ascending: false });

  if (eErr) throw eErr;

  const expenseIds = (exps ?? []).map((e) => e.id);
  let shrs: Tables<"expenseshares">[] = [];
  if (expenseIds.length > 0) {
    const { data: shares, error: sErr } = await supabase
      .from("expenseshares")
      .select("expense_id, user_id, amount")
      .in("expense_id", expenseIds);
    if (sErr) throw sErr;
    shrs = shares ?? [];
  }

  const sharesMapped: ExpenseShare[] = shrs.map((s) => ({
    expenseId: s.expense_id,
    userId: s.user_id,
    amount: s.amount,
  }));

  const expensesMapped: Expense[] = (exps ?? []).map((e) => ({
    id: e.id,
    amount: e.total_amount,
    category: enumToKoCategory[e.category],
    memberId: e.payer_id ?? "",
    participants: sharesMapped
      .filter((s) => s.expenseId === e.id)
      .map((s) => s.userId),
    memo: e.description,
    createdAt: e.expense_time, // YYYY-MM-DD
  }));

  return { expenses: expensesMapped, shares: sharesMapped };
}

export interface UpdateExpenseParams {
  expenseId: string;
  description: string;
  totalAmount: number;
  expenseTime: string;
  category: ExpenseCategoryEnum;
  payerId: string;
  participantIds: string[];
}

export async function updateExpenseWithShares(p: UpdateExpenseParams) {
  const { error: uErr } = await supabase
    .from("expenses")
    .update({
      description: p.description,
      total_amount: p.totalAmount,
      expense_time: p.expenseTime,
      category: p.category,
      payer_id: p.payerId,
    })
    .eq("id", p.expenseId);
  if (uErr) throw uErr;

  const { error: dErr } = await supabase
    .from("expenseshares")
    .delete()
    .eq("expense_id", p.expenseId);
  if (dErr) throw dErr;

  const allForSplit = new Set<string>([...p.participantIds, p.payerId]);
  const n = allForSplit.size || 1;
  const share = p.totalAmount / n;
  const rows = p.participantIds
    .filter((id) => id !== p.payerId)
    .map((uid) => ({ expense_id: p.expenseId, user_id: uid, amount: share }));
  if (rows.length > 0) {
    const { error: iErr } = await supabase.from("expenseshares").insert(rows);
    if (iErr) throw iErr;
  }
}

export async function deleteExpense(expenseId: string) {
  const { error: sErr } = await supabase
    .from("expenseshares")
    .delete()
    .eq("expense_id", expenseId);
  if (sErr) throw sErr;

  const { error: eErr } = await supabase
    .from("expenses")
    .delete()
    .eq("id", expenseId);
  if (eErr) throw eErr;
}
