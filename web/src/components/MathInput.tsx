import { useRef } from "react";

const ACTS: [string, string][] = [
  ["frac", "分数"],
  ["sup", "上标"],
  ["sub", "下标"],
  ["sqrt", "根号"],
];

const KEYS: [string, string[]][] = [
  ["运算", ["∫", "∬", "∂", "∑", "∏", "√", "∞", "→", "≈", "≠", "≤", "≥", "±", "×", "÷"]],
  ["希腊", ["π", "θ", "α", "β", "γ", "δ", "ε", "λ", "μ", "σ", "φ", "ω", "Δ", "Σ", "Ω"]],
  ["函数", ["lim", "ln", "sin", "cos", "tan", "dx", "dy", "dt", "e"]],
];

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

  const insert = (text: string) => {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const next = value.slice(0, start) + text + value.slice(end);
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      const caret = start + text.length;
      el.setSelectionRange(caret, caret);
    });
  };

  const act = (kind: string) => {
    if (kind === "frac") return insert("\\frac{}{}");
    if (kind === "sup") return insert("^{}");
    if (kind === "sub") return insert("_{}");
    if (kind === "sqrt") return insert("√()");
  };

  return (
    <div className="mathinput">
      <textarea
        ref={ref}
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
      <div className="kb">
        <div className="kbrow">
          {ACTS.map(([k, label]) => (
            <button type="button" key={k} onClick={() => act(k)}>
              {label}
            </button>
          ))}
        </div>
        {KEYS.map(([label, keys]) => (
          <div className="kbrow" key={label}>
            {keys.map((k) => (
              <button type="button" key={k} onClick={() => insert(k)}>
                {k}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
