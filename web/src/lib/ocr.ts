import { apiCfg, failureHint, normalizeApiUrl } from "./ai";

const OCR_PROMPT = [
  "你是题目转录工具。把图片里的题目转录成一行纯文本，规则：",
  "1. 数学符号一律用 Unicode：∫ ∂ ∑ √ ≤ ≥ ≠ ± × ÷ ∞ π θ α β γ Δ 等；",
  "2. 上下标用 ^{…} 和 _{…}，例如 e^{x}、∫_{0}^{1} x^{2} dx、lim_{x→0}；",
  "3. 分数用 \\frac{分子}{分母}，根号用 √(…)；",
  "4. 保留题号、括号、单位；",
  "5. 不要解题、不要解释、不要输出任何前后缀；",
  "6. 只输出题目本身，若图里没有题目，输出空字符串。",
].join("\n");

/** 图片 → 题干纯文本。需要「识图模型」，普通文本模型会报错。 */
export async function recognize(dataUrl: string): Promise<string> {
  const cfg = apiCfg();
  if (!cfg.url || !cfg.key) throw new Error("未配置接口");
  const model = cfg.vision || "";
  if (!model) throw new Error("未填写识图模型");

  const apiUrl = normalizeApiUrl(cfg.url);
  const res = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${cfg.key}` },
    body: JSON.stringify({
      model,
      temperature: 0,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: OCR_PROMPT },
            { type: "image_url", image_url: { url: dataUrl } },
          ],
        },
      ],
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(failureHint(res.status, body));
  }
  const data = await res.json();
  const text: string = data?.choices?.[0]?.message?.content ?? "";
  return text
    .trim()
    .replace(/^```[a-z]*\s*/i, "")
    .replace(/```$/, "")
    .trim();
}
