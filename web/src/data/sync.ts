import { supabase } from "../lib/supabase";
import type { BookState } from "./types";

/**
 * 一本书一份快照。先比 updated_at，服务端更新才覆盖本地；
 * 上传走 upsert，revison 每次加一。
 */
export async function pullBook(bookId: string): Promise<BookState | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("books")
    .select("payload, updated_at")
    .eq("book_id", bookId)
    .maybeSingle();
  if (error || !data) return null;
  return data.payload as BookState;
}

export async function pushBook(state: BookState): Promise<void> {
  if (!supabase) return;
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) return;

  await supabase.from("books").upsert(
    {
      user_id: userId,
      book_id: state.bookId,
      payload: state,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,book_id" }
  );
}

/** 本地优先：先读本地，云端更新才替换 */
export async function syncBook(local: BookState): Promise<BookState> {
  const remote = await pullBook(local.bookId);
  if (remote && (remote.updatedAt ?? 0) > (local.updatedAt ?? 0)) return remote;
  await pushBook(local);
  return local;
}
