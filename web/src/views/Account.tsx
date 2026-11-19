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
    setMsg("测试中…");
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
      setMsg(res.ok ? "连通了" : failureHint(res.status, body));
    } catch {
      setMsg("请求没到服务器：地址错误或被跨域拦下");
    }
  };

  return (
    <section>
      <h3>模型（AI 讲题用）</h3>
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
        <button onClick={test}>测试连接</button>
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
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase?.auth.getUser().then(({ data }) => setUser(data.user?.email ?? null));
    const sub = supabase?.auth.onAuthStateChange((_e, s) => setUser(s?.user?.email ?? null));
    return () => sub?.data.subscription.unsubscribe();
  }, []);

  const send = async () => {
    try {
      await signInWithEmail(email.trim());
      setMsg("登录链接已发到邮箱，点开即完成登录。");
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
    setMsg("备份已下载");
  };

  const importBackup = async (file: File) => {
    try {
      const data = JSON.parse(await file.text());
      const books = Array.isArray(data.books) ? data.books : [];
      if (!books.length) throw new Error("no books");
      for (const b of books) if (b?.bookId) saveState(b);
      setMsg(`已恢复 ${books.length} 本书的数据`);
    } catch {
      setMsg("文件读不出来");
    }
  };

  const bytes = PACKS.reduce(
    (n, p) => n + (localStorage.getItem(`budong.v1.${p.id}`)?.length ?? 0),
    0
  );

  return (
    <div className="account">
      <section>
        <h3>账号</h3>
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
                发送登录链接
              </button>
              <button className="wide" onClick={() => void signInWithGitHub()}>
                使用 GitHub 登录
              </button>
            </>
          )
        ) : (
          <p className="hint">未配置云端，当前只存本机。配置后可用邮箱登录并跨设备同步。</p>
        )}
        {msg && <p className="hint">{msg}</p>}
      </section>

      <section>
        <h3>数据</h3>
        <p className="row">
          本机占用<b>{(bytes / 1024).toFixed(0)} KB</b>
        </p>
        <ul className="rows">
          <li>
            <button onClick={exportBackup}>下载备份</button>
          </li>
          <li>
            <button onClick={() => fileRef.current?.click()}>从备份恢复</button>
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
      </section>

      <ModelSection />

      <section>
        <h3>关于</h3>
        <p className="row">
          版本<b>{new Date(__BUILD__).toLocaleDateString("zh-CN")}</b>
        </p>
        <p className="hint">
          内容包：{PACKS.map((p) => p.name).join("、")}。清除浏览器数据会清空本机记录，建议定期下载备份。
        </p>
      </section>
    </div>
  );
}
