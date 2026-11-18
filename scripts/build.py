#!/usr/bin/env python3
"""把 src/ 与 packs/*.json 拼成一个可以双击打开的单文件 index.html。

用法：
    python3 scripts/build.py

packs/ 下每个 JSON 都会打进产物，运行时由书架切换；calculus 排在第一个。
"""
import hashlib
import json
import pathlib
import shutil
import sys
from datetime import datetime

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "src"
PACKS = ROOT / "packs"
DEFAULT_PACK = "calculus"

# 构建产物同步到的位置（存在才复制）
MIRRORS = [
    ROOT.parent / "错题本.html",
    ROOT.parent / "budong.html",
    ROOT.parent / "cuotiben-site" / "index.html",
]


def public_notes(notes):
    """去掉只给校验脚本用的 verify 字段。"""
    out = {}
    for sid, sec in notes.items():
        item = {
            "concepts": sec.get("concepts", sec.get("points", [])),
            "types": sec["types"],
            "examples": [
                {"q": e["q"], "a": e.get("a", ""), "analysis": e.get("analysis", "")}
                for e in sec["examples"]
            ],
        }
        if sec.get("plain"):
            item["plain"] = True
        if sec.get("typesStyle"):
            item["typesStyle"] = sec["typesStyle"]
        out[sid] = item
    return out


def main():
    # 把 packs/ 下所有内容包都打进来，运行时由书架切换
    files = sorted(PACKS.glob("*.json"),
                   key=lambda f: (f.stem != DEFAULT_PACK, f.stem))
    if not files:
        sys.exit("packs/ 里没有内容包")

    packs = []
    for f in files:
        p = json.loads(f.read_text(encoding="utf-8"))
        p.setdefault("id", f.stem)
        packs.append(p)
    pack = packs[0]
    template = (SRC / "template.html").read_text(encoding="utf-8")
    css = ((SRC / "script-font.css").read_text(encoding="utf-8")
           + "\n"
           + (SRC / "style.css").read_text(encoding="utf-8"))
    app = (SRC / "app.js").read_text(encoding="utf-8")

    dump = lambda o: json.dumps(o, ensure_ascii=False, separators=(",", ":"))
    slim = []
    for p in packs:
        slim.append({
            "id": p["id"],
            "name": p["name"],
            "tagline": p.get("tagline", ""),
            "mark": p.get("mark", ""),
            "labels": p.get("labels", {}),
            "mode": p.get("mode", "course"),
            "meta": p.get("meta", ""),
            "book": p["book"],
            "notes": public_notes(p["notes"]),
        })
    body_hash = hashlib.sha1(dump(slim).encode("utf-8")).hexdigest()[:8]
    content_js = "const PACKS = " + dump(slim) + ";\nconst CONTENT_VER = \"" + body_hash + "\";\n"

    stamp = datetime.now().strftime("%Y-%m-%d %H:%M") + " · " + \
            hashlib.sha1((template + css + app + content_js).encode("utf-8")).hexdigest()[:6]

    html = (template
            .replace("{{PACK_NAME}}", pack["name"])
            .replace("{{BUILD}}", stamp)
            .replace("{{STYLE}}", css)
            .replace("{{SCRIPT}}", content_js + app))

    out = ROOT / "index.html"
    out.write_text(html, encoding="utf-8")

    detail = "，".join(p["name"] for p in packs)
    print(f"构建完成 {out.name}  {len(html.encode('utf-8')):,} 字节  "
          f"{len(packs)} 个内容包：{detail}")

    for m in MIRRORS:
        if m.exists():
            shutil.copyfile(out, m)
            print(f"  已同步 {m}")


if __name__ == "__main__":
    main()
