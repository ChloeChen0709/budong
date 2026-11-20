/**
 * 触摸按压反馈：按下 0.1s 收缩到 0.96，松手用弹簧曲线回弹。
 * 只加一个类，动画全部交给 CSS 的 transform / filter。
 */
const PRESSABLE =
  "button, .book, .choice, .page, .avatar, .toc li button, .sections li button, " +
  ".modules button, .modes button, .tabbar button, .marks button, .exl li, .vlbtn, .card";

let pressed: HTMLElement | null = null;
let startX = 0;
let startY = 0;

function release() {
  if (!pressed) return;
  pressed.classList.remove("is-pressed");
  pressed = null;
}

function findTarget(node: EventTarget | null): HTMLElement | null {
  if (!(node instanceof Element)) return null;
  return node.closest(PRESSABLE) as HTMLElement | null;
}

export function installPressFeedback() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  document.addEventListener(
    "pointerdown",
    (e) => {
      if (e.pointerType === "mouse") return; // 触屏才有按压感
      const el = findTarget(e.target);
      if (!el || (el as HTMLButtonElement).disabled) return;
      release();
      pressed = el;
      startX = e.clientX;
      startY = e.clientY;
      el.classList.add("is-pressed");
    },
    { passive: true }
  );

  // 手指滑动超过 8px 视为滚动，立刻取消按压，保证跟手
  document.addEventListener(
    "pointermove",
    (e) => {
      if (!pressed) return;
      if (Math.abs(e.clientX - startX) > 8 || Math.abs(e.clientY - startY) > 8) release();
    },
    { passive: true }
  );

  document.addEventListener("pointerup", release, { passive: true });
  document.addEventListener("pointercancel", release, { passive: true });
  window.addEventListener("scroll", release, { passive: true, capture: true });
}
