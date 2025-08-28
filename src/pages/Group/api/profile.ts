import { supabase } from "@/lib/supabaseClient";


export async function fetchProfileById(userId:string) {
    const { data, error } = await supabase
          .from("profile")
          .select("name, avatar_url")
          .eq("id", userId)
          .single();

        if (error) throw error;
        return data;
}

