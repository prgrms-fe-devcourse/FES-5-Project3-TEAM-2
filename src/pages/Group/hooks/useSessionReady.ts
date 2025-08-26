import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

export function useSessionReady() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let unsub: (() => void) | undefined;

    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setReady(true);
      } else {
        const { data: sub } = supabase.auth.onAuthStateChange((event) => {
          if (event === "INITIAL_SESSION" || event === "SIGNED_IN") {
            setReady(true);
            sub.subscription.unsubscribe(); // 구독 취소
          }
        });
        unsub = () => sub.subscription.unsubscribe();
      }
    })();

    return () => unsub?.();
  }, []);

  return ready;
}
