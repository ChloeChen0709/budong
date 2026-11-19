import { useEffect, useRef, useState } from "react";
import { isCloudEnabled, signInWithEmail, signInWithGitHub, supabase } from "../lib/supabase";
import { PACKS } from "../data/packs";
import { loadState, saveState } from "../data/store";
import { apiCfg, hostModel, normalizeApiUrl, saveApiCfg, failureHint } from "../lib/ai";

function ModelSection() {
  const init = apiCfg();
  const [url, setUrl] = useState(init.url ?? "");
  const [model, setModel] = useState(init.model ?? "");
  const [key, setKey] = useState(init.key ?? "");
  const [msg, setMsg] = useState("");

  const save = () => {
    saveApiCfg({ url: normalizeApiUrl(url), model: model || hostModel(url), key });
    setMsg("已保存");
  };

  const test = async () => {
    setMsg("测试中");
    try {
      const res = await fetch(normalizeApiUrl(url), {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
        body: JSON.stringify({
          model: model || hostModel(url),
          messages: [{ role: "user", content: "回复 ok" }],
        }),
      });
      const body = await res.text();
      setMsg(res.ok ? "可用" : failureHint(res.status, body));
    } catch {
      setMsg("请求未发出：地址错误或跨域被拦");
    }
  };

  return (
    <section>
      <h3>接口</h3>
      <label htmlFor="apiUrl">接口地址</label>
      <input
        id="apiUrl"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://api.deepseek.com"
        onBlur={() => !model && setModel(hostModel(url))}
      />
      <label htmlFor="apiModel">模型名</label>
      <input id="apiModel" value={model} onChange={(e) => setModel(e.target.value)} placeholder="deepseek-chat" />
      <label htmlFor="apiKey">API Key</label>
      <input id="apiKey" type="password" value={key} onChange={(e) => setKey(e.target.value)} placeholder="sk-..." />
      <div className="row2">
        <button onClick={test}>测试</button>
        <button className="primary" onClick={save}>保存</button>
      </div>
      {msg && <p className="hint">{msg}</p>}
    </section>
  );
}

export default function Account() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [user, setUser] = useState<string | null>(null);
  const [pane, setPane] = useState<"账号" | "数据" | "模型" | "关于">("账号");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase?.auth.getUser().then(({ data }) => setUser(data.user?.email ?? null));
    const sub = supabase?.auth.onAuthStateChange((_e, s) => setUser(s?.user?.email ?? null));
    return () => sub?.data.subscription.unsubscribe();
  }, []);

  const send = async () => {
    try {
      await signInWithEmail(email.trim());
      setMsg("登录链接已发送");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "登录失败");
    }
  };

  const exportBackup = () => {
    const data = { v: 2, books: PACKS.map((p) => loadState(p)), exportedAt: Date.now() };
    const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `不懂备份-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    setMsg("已下载");
  };

  const importBackup = async (file: File) => {
    try {
      const data = JSON.parse(await file.text());
      const books = Array.isArray(data.books) ? data.books : [];
      if (!books.length) throw new Error("no books");
      for (const b of books) if (b?.bookId) saveState(b);
      setMsg(`已恢复 ${books.length} 本`);
    } catch {
      setMsg("文件无法读取");
    }
  };

  const bytes = PACKS.reduce(
    (n, p) => n + (localStorage.getItem(`budong.v1.${p.id}`)?.length ?? 0),
    0
  );

  return (
    <div className="account">
      <nav className="modes">
        {(["账号", "数据", "模型", "关于"] as const).map((k) => (
          <button key={k} className={pane === k ? "on" : ""} onClick={() => setPane(k)}>
            {k}
          </button>
        ))}
      </nav>

      {pane === "账号" && (
      <section>
        {isCloudEnabled ? (
          user ? (
            <>
              <p className="row">
                已登录<b>{user}</b>
              </p>
              <button className="wide" onClick={() => supabase?.auth.signOut()}>
                退出登录
              </button>
            </>
          ) : (
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
                发送链接
              </button>
              <button className="wide" onClick={() => void signInWithGitHub()}>
                使用 GitHub 登录
              </button>
            </>
          )
        ) : (
          <p className="hint">未配置云端，仅存本机</p>
        )}
        {msg && <p className="hint">{msg}</p>}
      </section>
      )}

      {pane === "数据" && (
      <section>
        <p className="row">
          本机占用<b>{(bytes / 1024).toFixed(0)} KB</b>
        </p>
        <ul className="rows">
          <li>
            <button onClick={exportBackup}>导出</button>
          </li>
          <li>
            <button onClick={() => fileRef.current?.click()}>恢复</button>
            <input
              ref={fileRef}
              type="file"
              accept=".json,application/json"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                e.target.value = "";
                if (f) void importBackup(f);
              }}
            />
          </li>
        </ul>
        {msg && <p className="hint">{msg}</p>}
      </section>
      )}

      {pane === "模型" && <ModelSection />}

      {pane === "关于" && (
      <section>
        <p className="row">
          版本<b>{new Date(__BUILD__).toLocaleDateString("zh-CN")}</b>
        </p>
        <p className="hint">
          {PACKS.map((p) => p.name).join("、")}·清除浏览器数据会清空本机记录
        </p>
      </section>
      )}
    </div>
  );
}
