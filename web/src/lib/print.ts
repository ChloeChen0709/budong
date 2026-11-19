import type { BookState, Pack } from "../data/types";
import { renderMath } from "./math";
import { causeOf } from "../data/course";

const esc = (s: string) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] as string));

/** 把要打印的内容塞进隐藏容器，再交给浏览器打印；样式见 @media print */
export function exportPdf(pack: Pack, state: BookState) {
  const host = document.getElementById("printroot") ?? document.body.appendChild(Object.assign(document.createElement("div"), { id: "printroot" }));
  const parts: string[] = [];

  if (pack.mode === "exam") {
    for (const ch of pack.book.chapters) {
      parts.push(`<h1>${esc(ch.no)} ${esc(ch.title)}</h1>`);
      for (const s of ch.sections) {
        const nt = state.notes[s.id];
        if (!nt) continue;
        parts.push(`<h2>${esc(s.id)} ${esc(s.title)}</h2>`);
        if (nt.concepts?.length) parts.push(`<ul>${nt.concepts.map((c) => `<li>${esc(c)}</li>`).join("")}</ul>`);
        for (const e of nt.examples ?? []) {
          parts.push(`<p class="p">${renderMath(e.q)}　${renderMath(e.a ?? "")}</p>`);
        }
      }
    }
  } else {
    parts.push(`<h1>${esc(pack.name)} · 错题</h1>`);
    for (const it of state.items ?? []) {
      parts.push(`<p class="p">${renderMath(it.q)}<span class="m">${esc(causeOf(it.cause).name)} · ${esc(it.sec)}</span></p>`);
      if (it.img) parts.push(`<img src="${it.img}" alt="" />`);
    }
  }

  host.innerHTML = parts.join("");
  host.className = "printonly";
  window.print();
  setTimeout(() => {
    host.innerHTML = "";
  }, 500);
}
