import type { Database } from "@/types/supabase";

export type Photo = Database["public"]["Tables"]["photos"]["Row"];