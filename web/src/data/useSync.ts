import { useEffect, useRef, useState } from "react";
import type { BookState } from "./types";
import { pullBook, pushBook } from "./sync";
import { supabase } from "../lib/supabase";

export type SyncStatus = "off" | "idle" | "pulling" | "pushing" | "error";

/** 本地优先：进入时比 updatedAt，云端更新才覆盖；改动后防抖上传 */
export function useSync(
  state: BookState | null,
  setState: (s: BookState) => void
): SyncStatus {
  const [status, setStatus] = useState<SyncStatus>("off");
  const timer = useRef<number | undefined>(undefined);
  const ready = useRef(false);

  useEffect(() => {
    const sb = supabase;
    if (!sb) return setStatus("off");
    let cancelled = false;
    const run = async () => {
      const { data } = await sb.auth.getUser();
      if (!data.user) return setStatus("off");
      if (!state) return;
      setStatus("pulling");
      const remote = await pullBook(state.bookId);
      if (cancelled) return;
      if (remote && (remote.updatedAt ?? 0) > (state.updatedAt ?? 0)) {
        setState(remote);
      } else {
        await pushBook(state);
      }
      ready.current = true;
      setStatus("idle");
    };
    void run();

    // 登录/退出后重新跑一次，避免刚登录时不同步
    const sub = sb.auth.onAuthStateChange(() => {
      ready.current = false;
      void run();
    });
    return () => {
      cancelled = true;
      sub.data.subscription.unsubscribe();
    };
    // 只在切换书本时拉一次
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.bookId]);

  useEffect(() => {
    if (!supabase || !state || !ready.current) return;
    window.clearTimeout(timer.current);
    setStatus("pushing");
    timer.current = window.setTimeout(async () => {
      try {
        await pushBook(state);
        setStatus("idle");
      } catch {
        setStatus("error");
      }
    }, 800);
    return () => window.clearTimeout(timer.current);
  }, [state]);

  return status;
}
