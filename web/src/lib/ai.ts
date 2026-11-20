import { plainMath } from "./math";

const APIK = "budong.api.v1";

export interface ApiCfg {
  url?: string;
  model?: string;
  vision?: string;
  key?: string;
}

export const PROVIDERS: Record<string, { path: string; model: string }> = {
  "api.deepseek.com": { path: "/chat/completions", model: "deepseek-chat" },
  "api.openai.com": { path: "/v1/chat/completions", model: "gpt-4o-mini" },
  "open.bigmodel.cn": { path: "/api/paas/v4/chat/completions", model: "glm-4-flash" },
  "dashscope.aliyuncs.com": { path: "/compatible-mode/v1/chat/completions", model: "qwen-plus" },
  "api.moonshot.cn": { path: "/v1/chat/completions", model: "moonshot-v1-8k" },
  "api.siliconflow.cn": { path: "/v1/chat/completions", model: "Qwen/Qwen2.5-7B-Instruct" },
};

export function apiCfg(): ApiCfg {
  try {
    return JSON.parse(localStorage.getItem(APIK) ?? "{}") as ApiCfg;
  } catch {
    return {};
  }
}

export function saveApiCfg(cfg: ApiCfg) {
  localStorage.setItem(APIK, JSON.stringify(cfg));
}

/** 只填域名也行，缺的路径按厂商补 */
export function normalizeApiUrl(raw?: string): string {
  let u = (raw ?? "").trim().replace(/[\u200b-\u200d\ufeff]/g, "");
  if (!u) return "";
  if (!/^https?:\/\//i.test(u)) u = "https://" + u;
  let parsed: URL;
  try {
    parsed = new URL(u);
  } catch {
    return "";
  }
  const host = parsed.hostname.replace(/^www\./, "");
  const known = PROVIDERS[host];
  if (!known) return parsed.toString();
  const bare = parsed.pathname === "/" || parsed.pathname === "";
  if (bare) return `${parsed.origin}${known.path}`;
  if (parsed.pathname.endsWith("/api/v1") || parsed.pathname.endsWith("/api/v1/")) {
    return `${parsed.origin}${known.path}`;
  }
  return parsed.toString();
}

export const hostModel = (url?: string) => {
  try {
    return PROVIDERS[new URL(normalizeApiUrl(url)).hostname.replace(/^www\./, "")]?.model ?? "";
  } catch {
    return "";
  }
};

export async function explainItem(input: {
  book: string;
  sec: string;
  cause: string;
  q: string;
}): Promise<{ why: string; how: string; fix: string }> {
  const cfg = apiCfg();
  if (!cfg.url || !cfg.key || !cfg.model) throw new Error("未配置模型");

  const sys =
    "你是一位耐心的大学数学助教。用中文回答，分三段：错在哪、正确思路、要补什么。每段不超过两句话，不要客套。";
  const user = `教材：${input.book}\n章节：${input.sec}\n学生打的错因：${input.cause}\n题目：${plainMath(
    input.q
  )}\n\n请按三段输出，用「1.」「2.」「3.」开头。`;

  const apiUrl = normalizeApiUrl(cfg.url);
  const res = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${cfg.key}` },
    body: JSON.stringify({
      model: cfg.model,
      temperature: 0.3,
      messages: [
        { role: "system", content: sys },
        { role: "user", content: user },
      ],
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(failureHint(res.status, body));
  }
  const data = await res.json();
  const text: string = data?.choices?.[0]?.message?.content ?? "";
  if (!text) throw new Error("模型没有返回内容");
  const parts = text.split(/\n?\s*[123][.、]\s*/).filter(Boolean);
  return { why: parts[0] ?? text, how: parts[1] ?? "", fix: parts[2] ?? "" };
}

export function failureHint(status: number, body: string): string {
  const detail = body.slice(0, 160);
  if (status === 401 || status === 403) return `key 或权限有问题（HTTP ${status}）：${detail}`;
  if (status === 404) return `地址或模型名不对（HTTP 404）：${detail}`;
  if (status === 429) return "请求太频繁或额度用完（HTTP 429）";
  if (status >= 500) return `服务端出错（HTTP ${status}），稍后再试`;
  return `HTTP ${status}：${detail}`;
}

/** 未配置模型时的规则提示 */
export function ruleHint(): { why: string; how: string; fix: string } {
  return {
    why: "按你选的错因，先确认是概念不清还是计算失误。",
    how: "把这一节的例题重做一遍，重点看第一步怎么下手。",
    fix: "回到知识点，把相关定义和定理读一遍再做题。",
  };
}
