import { useMemo, useState } from "react";
import { MathText } from "../lib/math";

type Part =
  | { kind: "text"; v: string }
  | { kind: "frac"; n: string; d: string }
  | { kind: "sup"; v: string }
  | { kind: "sub"; v: string }
  | { kind: "sqrt"; v: string };

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

/** 把带记号的一行拆成「文字 + 结构」的块，便于直接改内容 */
function parse(src: string): Part[] {
  const out: Part[] = [];
  let buf = "";
  const flush = () => { if (buf) { out.push({ kind: "text", v: buf }); buf = ""; } };
  const read = (i: number) => {
    let depth = 0, s = "";
    for (let j = i; j < src.length; j++) {
      if (src[j] === "{") { depth++; if (depth === 1) continue; }
      else if (src[j] === "}") { depth--; if (depth === 0) return { body: s, next: j + 1 }; }
      s += src[j];
    }
    return { body: s, next: src.length };
  };
  let i = 0;
  while (i < src.length) {
    if (src.startsWith("\\frac", i)) {
      const a = read(i + 5); const b = read(a.next);
      flush(); out.push({ kind: "frac", n: a.body, d: b.body }); i = b.next; continue;
    }
    if (src.startsWith("\\sqrt", i)) {
      const a = read(i + 5); flush(); out.push({ kind: "sqrt", v: a.body }); i = a.next; continue;
    }
    if (src.startsWith("^{", i)) {
      const a = read(i + 1); flush(); out.push({ kind: "sup", v: a.body }); i = a.next; continue;
    }
    if (src.startsWith("_{", i)) {
      const a = read(i + 1); flush(); out.push({ kind: "sub", v: a.body }); i = a.next; continue;
    }
    buf += src[i++];
  }
  flush();
  return out.length ? out : [{ kind: "text", v: "" }];
}

function serialize(parts: Part[]): string {
  return parts.map(p => {
    if (p.kind === "text") return p.v;
    if (p.kind === "frac") return `\\frac{${p.n}}{${p.d}}`;
    if (p.kind === "sqrt") return `\\sqrt{${p.v}}`;
    if (p.kind === "sup") return `^{${p.v}}`;
    return `_{${p.v}}`;
  }).join("");
}

export default function MathInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [parts, setParts] = useState<Part[]>(() => parse(value));

  const commit = (next: Part[]) => { setParts(next); onChange(serialize(next)); };

  const setAt = (i: number, patch: Partial<Part>) => {
    const next = parts.map((p, k) => (k === i ? ({ ...p, ...patch } as Part) : p));
    commit(next);
  };

  const add = (kind: string) => {
    const block: Part =
      kind === "frac" ? { kind: "frac", n: "", d: "" } :
      kind === "sqrt" ? { kind: "sqrt", v: "" } :
      kind === "sup" ? { kind: "sup", v: "" } : { kind: "sub", v: "" };
    commit([...parts, block, { kind: "text", v: "" }]);
  };

  const pushKey = (k: string) => {
    const last = parts[parts.length - 1];
    if (last && last.kind === "text") setAt(parts.length - 1, { v: last.v + k } as Partial<Part>);
    else commit([...parts, { kind: "text", v: k }]);
  };

  const size = (p: Part) => (p.kind === "sup" || p.kind === "sub" ? "0.78em" : undefined);
  const lift = (p: Part) => (p.kind === "sup" ? { verticalAlign: "super" as const } : p.kind === "sub" ? { verticalAlign: "sub" as const } : {});

  const plain = useMemo(() => serialize(parts), [parts]);

  return (
    <div className="mathinput">
      <div className="mline">
        {parts.map((p, i) => {
          if (p.kind === "text")
            return (
              <input
                key={i}
                className="mtext"
                style={{ width: `${Math.max(2, p.v.length || 2) * 1.02 + 0.6}ch` }}
                value={p.v}
                placeholder={i === 0 ? "题目" : ""}
                onChange={(e) => setAt(i, { v: e.target.value } as Partial<Part>)}
              />
            );
          if (p.kind === "frac")
            return (
              <span className="mfrac" key={i}>
                <input className="slot" style={{ width: `${Math.max(2, (p.n.length || 1)) * 1.0 + 0.8}ch` }} value={p.n} placeholder="分子"
                  onChange={(e) => setAt(i, { n: e.target.value } as Partial<Part>)} />
                <input className="slot" style={{ width: `${Math.max(2, (p.d.length || 1)) * 1.0 + 0.8}ch` }} value={p.d} placeholder="分母"
                  onChange={(e) => setAt(i, { d: e.target.value } as Partial<Part>)} />
              </span>
            );
          if (p.kind === "sqrt")
            return (
              <span className="msqrt" key={i}>
                <span className="hook">√</span>
                <input className="slot" style={{ width: `${Math.max(2, (p.v.length || 1)) * 1.0 + 0.8}ch` }} value={p.v} placeholder="根号内"
                  onChange={(e) => setAt(i, { v: e.target.value } as Partial<Part>)} />
              </span>
            );
          return (
            <input
              key={i}
              className="mslotsmall"
              style={{ fontSize: size(p), width: `${Math.max(1.5, (p.v.length || 1))}ch`, ...lift(p) }}
              value={p.v}
              placeholder={p.kind === "sup" ? "上标" : "下标"}
              onChange={(e) => setAt(i, { v: e.target.value } as Partial<Part>)}
            />
          );
        })}
        {!parts.length && <input className="mtext" placeholder="题目" value="" readOnly />}
      </div>

      <div className="kb">
        <div className="kbrow">
          {ACTS.map(([k, label]) => (
            <button type="button" key={k} onClick={() => add(k)}>{label}</button>
          ))}
        </div>
        {KEYS.map(([label, keys]) => (
          <div className="kbrow" key={label}>
            {keys.map((k) => (
              <button type="button" key={k} onClick={() => pushKey(k)}>{k}</button>
            ))}
          </div>
        ))}
      </div>

      {plain && (
        <div className="mpreview">
          <span className="pvlabel">预览</span>
          <MathText text={plain} />
        </div>
      )}
    </div>
  );
}
