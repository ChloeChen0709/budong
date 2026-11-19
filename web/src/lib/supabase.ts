import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/** 允许直接粘 REST 端点（…/rest/v1/），这里统一还原成项目根地址 */
const normalize = (raw?: string) =>
  raw ? raw.trim().replace(/\/+$/, "").replace(/\/rest\/v1$/, "") : undefined;

const url = normalize(import.meta.env.VITE_SUPABASE_URL);
const key = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

/** 没配置环境变量时返回 null，界面走纯本地模式 */
export const supabase: SupabaseClient | null =
  url && key
    ? createClient(url, key, {
        auth: {
          persistSession: true,
          detectSessionInUrl: true,   // 邮件链接带回的 #access_token 由它接住
          flowType: "implicit",
        },
      })
    : null;

/** 邮件链接失败时 Supabase 会把原因放在 URL 上，取出来给界面显示 */
export function urlAuthError(): string | null {
  const h = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const q = new URLSearchParams(window.location.search);
  const msg = h.get("error_description") || q.get("error_description") || h.get("error") || q.get("error");
  return msg ? decodeURIComponent(msg.replace(/\+/g, " ")) : null;
}

export const isCloudEnabled = Boolean(supabase);

export async function currentUser() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}

export async function signInWithEmail(email: string) {
  if (!supabase) throw new Error("未配置云端");
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.origin },
  });
  if (error) throw error;
}

export async function signOut() {
  if (!supabase) return;
  await supabase.auth.signOut();
}

/** GitHub 登录：跳转回来时会带 #access_token，supabase-js 自己接住 */
export async function signInWithGitHub() {
  if (!supabase) throw new Error("未配置云端");
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: { redirectTo: window.location.origin + import.meta.env.BASE_URL },
  });
  if (error) throw error;
}
