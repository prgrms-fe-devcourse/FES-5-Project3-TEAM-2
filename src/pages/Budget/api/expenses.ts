import { supabase } from "@/lib/supabaseClient";
import type { TablesInsert, Enums } from "@/types/supabase";

export type ExpenseCategoryEnum = Enums<"expense_category">; // "food" | "transport" | ...

export const koToEnumCategory: Record<string, ExpenseCategoryEnum> = {
  "식비": "food",
  "교통비": "transport",
  "숙박비": "hotel",
  "활동비": "activity",
  "기타": "other",
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
  // 1) Insert into expenses
  const expense: TablesInsert<"expenses"> = {
    group_id: p.groupId,
    description: p.description,
    total_amount: p.totalAmount,
    expense_time: p.expenseTime,
    category: p.category,
  };

  const { data: created, error: eErr } = await supabase
    .from("expenses")
    .insert(expense)
    .select()
    .maybeSingle();

  if (eErr) throw eErr;
  if (!created) throw new Error("Failed to insert expense");

  // 2) Compute shares (participants ∪ payer) then assign share to participants excluding payer
  const allForSplit = new Set<string>([...p.participantIds, p.payerId]);
  const n = allForSplit.size || 1;
  const share = p.totalAmount / n;

  const rows = p.participantIds
    .filter((id) => id !== p.payerId)
    .map((uid) => ({ expense_id: created.id, user_id: uid, amount: share }));

  if (rows.length > 0) {
    const { error: sErr } = await supabase.from("expenseshares").insert(rows);
    if (sErr) throw sErr;
  }

  return created;
}

