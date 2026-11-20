#!/usr/bin/env python3
"""用符号计算核对 packs/ 里每个例题的答案。

需要 sympy：pip install sympy
用法：python3 scripts/verify.py
"""
import json
import pathlib
import sys

try:
    import sympy as sp
except ImportError:
    sys.exit("需要 sympy：pip install sympy")

ROOT = pathlib.Path(__file__).resolve().parent.parent
PACKS = ROOT / "packs"

x, y, n, t, h = sp.symbols("x y n t h")
ENV = {"x": x, "y": y, "n": n, "t": t, "h": h,
       "log": sp.log, "exp": sp.exp, "sin": sp.sin, "cos": sp.cos,
       "tan": sp.tan, "sqrt": sp.sqrt, "pi": sp.pi, "oo": sp.oo}


def S(expr):
    return sp.sympify(expr, locals=ENV)


def check(kind, a):
    if kind == "limit":
        f, var, to, val = a
        to = sp.oo if to in ("oo", "∞") else S(to)
        return sp.simplify(sp.limit(S(f), ENV[var], to) - S(val)) == 0
    if kind == "diff":
        f, _v, d = a
        return sp.simplify(sp.diff(S(f), x) - S(d)) == 0
    if kind == "diff2":
        f, _v, d = a
        return sp.simplify(sp.diff(S(f), x, 2) - S(d)) == 0
    if kind == "int":
        f, _v, F = a
        return sp.simplify(sp.diff(S(F), x) - S(f)) == 0
    if kind == "defint":
        f, _v, lo, hi, val = a
        return sp.simplify(sp.integrate(S(f), (x, S(lo), S(hi))) - S(val)) == 0
    if kind == "ftc":
        f, v, lo, _up, val = a
        var = ENV.get(v, x)
        got = sp.diff(sp.integrate(S(f), (var, S(lo), var)), var)
        return sp.simplify(got.subs(var, x) - S(val)) == 0
    if kind == "solve":
        e, _v, root = a
        return any(sp.simplify(r - S(root)) == 0 for r in sp.solve(S(e), x))
    if kind == "partial":
        f, _v, fx = a
        return sp.simplify(sp.diff(S(f), x) - S(fx)) == 0
    if kind == "double":
        f, lo1, hi1, lo2, hi2, val = a
        got = sp.integrate(S(f), (x, S(lo1), S(hi1)), (y, S(lo2), S(hi2)))
        return sp.simplify(got - S(val)) == 0
    if kind == "conv":
        term, _v, expect = a
        got = sp.summation(S(term), (n, 1, sp.oo))
        return str(bool(got.is_finite)) == expect
    raise ValueError(f"未知校验类型 {kind}")


def main():
    bad = total = 0
    for path in sorted(PACKS.glob("*.json")):
        pack = json.loads(path.read_text(encoding="utf-8"))
        for sid, sec in pack["notes"].items():
            for i, ex in enumerate(sec["examples"]):
                v = ex.get("verify")
                if not v:
                    continue
                total += 1
                if v["kind"] == "domain":
                    continue  # 定义域类不做符号校验
                try:
                    ok = check(v["kind"], v["args"])
                except Exception as e:  # noqa: BLE001
                    ok, v = False, {**v, "error": str(e)}
                if not ok:
                    bad += 1
                    print(f"[失败] {path.stem} {sid} 例{i + 1}: {ex['q']}")
                    print(f"       答案 {ex['a']}\n       {v}")
    print(f"校验 {total} 个例题，失败 {bad} 个")
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
