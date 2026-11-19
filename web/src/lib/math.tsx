import type { ReactElement } from "react";

/** 数学记号：存储用纯文本（\frac{2}{3}、^{x}、_{n}），渲染成书写样式 */
const esc = (s: string) =>
  s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] as string));

function readBraced(src: string, idx: number): { body: string; next: number } {
  let depth = 0;
  let out = "";
  for (let j = idx; j < src.length; j++) {
    const ch = src[j];
    if (ch === "{") {
      depth++;
      if (depth === 1) continue;
    } else if (ch === "}") {
      depth--;
      if (depth === 0) return { body: out, next: j + 1 };
    }
    out += ch;
  }
  return { body: out, next: src.length };
}

export function renderMath(src: string): string {
  const plain = (t: string) =>
    esc(t)
      .replace(/\^\{([^{}]*)\}/g, "<sup>$1</sup>")
      .replace(/\^\(([^()]*)\)/g, "<sup>$1</sup>")
      .replace(/\^([A-Za-z0-9])/g, "<sup>$1</sup>")
      .replace(/_\{([^{}]*)\}/g, "<sub>$1</sub>")
      .replace(/_\(([^()]*)\)/g, "<sub>$1</sub>")
      .replace(/_([A-Za-z0-9])/g, "<sub>$1</sub>");

  let out = "";
  let buf = "";
  let i = 0;
  const flush = () => {
    if (buf) {
      out += plain(buf);
      buf = "";
    }
  };

  while (i < src.length) {
    if (src.startsWith("\\frac", i) && src[i + 5] === "{") {
      const a = readBraced(src, i + 5);
      const b = readBraced(src, a.next);
      flush();
      out += `<span class="frc"><span class="frc-n">${renderMath(a.body)}</span><span class="frc-d">${renderMath(b.body)}</span></span>`;
      i = b.next;
      continue;
    }
    if (src.startsWith("^{", i)) {
      const a = readBraced(src, i + 1);
      flush();
      out += `<sup>${renderMath(a.body)}</sup>`;
      i = a.next;
      continue;
    }
    if (src.startsWith("_{", i)) {
      const a = readBraced(src, i + 1);
      flush();
      out += `<sub>${renderMath(a.body)}</sub>`;
      i = a.next;
      continue;
    }
    buf += src[i];
    i++;
  }
  flush();
  return out;
}

/** 去掉记号，只留人读的纯文本，用于发给模型 */
export const plainMath = (s: string) => s.replace(/\^\{([^{}]*)\}/g, "^$1").replace(/_\{([^{}]*)\}/g, "_$1").replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, "($1)/($2)");

export function MathText({ text }: { text: string }): ReactElement {
  return <span dangerouslySetInnerHTML={{ __html: renderMath(text) }} />;
}
