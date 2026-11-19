import { useState } from "react";
import { isCloudEnabled, signInWithEmail } from "../lib/supabase";

export default function Account() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  const send = async () => {
    try {
      await signInWithEmail(email.trim());
      setMsg("登录链接已发到邮箱，点开即可。");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "登录失败");
    }
  };

  return (
    <div className="account">
      {isCloudEnabled ? (
        <>
          <label htmlFor="email">邮箱</label>
          <input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
          <button className="primary wide" onClick={send} disabled={!email.includes("@")}>
            发送登录链接
          </button>
          {msg && <p className="hint">{msg}</p>}
        </>
      ) : (
        <p className="hint">云端未配置。设置 VITE_SUPABASE_URL 与 VITE_SUPABASE_ANON_KEY 后启用账号与同步。</p>
      )}
    </div>
  );
}
