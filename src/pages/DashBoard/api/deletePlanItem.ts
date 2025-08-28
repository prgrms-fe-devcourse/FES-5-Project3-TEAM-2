import { supabase } from "@/lib/supabaseClient"

export async function deletePlanItem(itemId: string) {
  if (!itemId) {
    throw new Error("필수 파라미터 itemId 누락")
  }

  const { error } = await supabase
    .from("planitems")
    .delete()
    .eq("id", itemId)

  if (error) {
    throw new Error(`Supabase 삭제 실패: ${error.message}`)
  }

  console.log(`🗑️ Plan item deleted successfully: ${itemId}`)
  return true
}
