import { useRef } from "react";

const ACTS: [string, string, number][] = [
  // 键名、插入文本、插入后光标相对起点的位置（放在第一个 {} 内）
  ["frac", "\\frac{}{}", 6],
  ["sup", "^{}", 2],
  ["sub", "_{}", 2],
  ["sqrt", "\\sqrt{}", 6],
];

const KEYS: [string, string[]][] = [
  ["运算", ["∫", "∬", "∂", "∑", "∏", "√", "∞", "→", "≈", "≠", "≤", "≥", "±", "×", "÷"]],
  ["希腊", ["π", "θ", "α", "β", "γ", "δ", "ε", "λ", "μ", "σ", "φ", "ω", "Δ", "Σ", "Ω"]],
  ["函数", ["lim", "ln", "sin", "cos", "tan", "dx", "dy", "dt", "e"]],
];

/** 找到光标所在的那对花括号，返回 { 与 } 的位置 */
function bracesAround(v: string, caret: number): { open: number; close: number } | null {
  let open = -1;
  for (let i = caret - 1; i >= 0; i--) {
    if (v[i] === "}") break;
    if (v[i] === "{") { open = i; break; }
  }
  if (open < 0) return null;
  let depth = 0;
  for (let i = open; i < v.length; i++) {
    if (v[i] === "{") depth++;
    else if (v[i] === "}") { depth--; if (depth === 0) return { open, close: i }; }
  }
  return null;
}

export default function MathInput({
  value,
  onChange,
  rows = 4,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const put = (text: string, offset: number) => {
    const el = ref.current;
    if (!el) return;
    const s = el.selectionStart;
    const e = el.selectionEnd;
    onChange(value.slice(0, s) + text + value.slice(e));
    requestAnimationFrame(() => {
      el.focus();
      const at = s + offset;
      el.setSelectionRange(at, at);
    });
  };

  /** Tab：从分子跳到分母；已在分母则跳出花括号 */
  const nextSlot = () => {
    const el = ref.current;
    if (!el) return false;
    const caret = el.selectionStart;
    const b = bracesAround(value, caret);
    if (!b) return false;
    const after = value.slice(b.close + 1);
    const m = /^\{([^{}]*)\}/.exec(after);
    if (m) {
      const at = b.close + 2;
      el.setSelectionRange(at, at);
      return true;
    }
    const at = b.close + 1;
    el.setSelectionRange(at, at);
    return true;
  };

  const act = (key: string) => {
    const hit = ACTS.find((a) => a[0] === key);
    if (hit) put(hit[1], hit[2]);
  };

  return (
    <div className="mathinput">
      <textarea
        ref={ref}
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Tab" && nextSlot()) e.preventDefault();
        }}
      />
      <div className="kb">
        <div className="kbrow">
          {ACTS.map(([k, , ]) => (
            <button type="button" key={k} onClick={() => act(k)}>
              {k === "frac" ? "分数" : k === "sup" ? "上标" : k === "sub" ? "下标" : "根号"}
            </button>
          ))}
        </div>
        {KEYS.map(([label, keys]) => (
          <div className="kbrow" key={label}>
            {keys.map((k) => (
              <button type="button" key={k} onClick={() => put(k, k.length)}>
                {k}
              </button>
            ))}
          </div>
        ))}
      </div>
      <p className="kbhint">点「分数」后光标停在分子，填完按 Tab 跳到分母。</p>
    </div>
  );
}
