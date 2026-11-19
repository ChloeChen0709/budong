import { useEffect, useRef, useState } from "react";

/** 框选一块区域再压缩，避免整张照片塞进本地存储 */
export default function CropDialog({
  file,
  onDone,
  onCancel,
}: {
  file: File;
  onDone: (dataUrl: string) => void;
  onCancel: () => void;
}) {
  const [src, setSrc] = useState<string>();
  const imgRef = useRef<HTMLImageElement>(null);
  const [rect, setRect] = useState<{ x: number; y: number; w: number; h: number }>();
  const drag = useRef<{ x: number; y: number }>();

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const toLocal = (e: React.PointerEvent) => {
    const box = imgRef.current!.getBoundingClientRect();
    return {
      x: Math.min(Math.max(e.clientX - box.left, 0), box.width),
      y: Math.min(Math.max(e.clientY - box.top, 0), box.height),
    };
  };

  const start = (e: React.PointerEvent) => {
    const p = toLocal(e);
    drag.current = p;
    setRect({ x: p.x, y: p.y, w: 0, h: 0 });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const move = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const p = toLocal(e);
    const s = drag.current;
    setRect({ x: Math.min(s.x, p.x), y: Math.min(s.y, p.y), w: Math.abs(p.x - s.x), h: Math.abs(p.y - s.y) });
  };

  const finish = () => {
    const img = imgRef.current;
    if (!img || !rect || rect.w < 12 || rect.h < 12) return;
    const scale = img.naturalWidth / img.getBoundingClientRect().width;
    const canvas = document.createElement("canvas");
    const w = Math.min(1000, Math.round(rect.w * scale));
    canvas.width = w;
    canvas.height = Math.round((rect.h / rect.w) * w);
    canvas.getContext("2d")?.drawImage(img, Math.round(rect.x * scale), Math.round(rect.y * scale), Math.round(rect.w * scale), Math.round(rect.h * scale), 0, 0, canvas.width, canvas.height);
    onDone(canvas.toDataURL("image/jpeg", 0.75));
    drag.current = undefined;
  };

  return (
    <div className="cropmask">
      <div className="cropbox">
        <p className="hint">在图上拖拽，框出要保留的部分</p>
        {src && (
          <div className="cropimg">
            <img
              ref={imgRef}
              src={src}
              alt=""
              onPointerDown={start}
              onPointerMove={move}
              onPointerUp={finish}
            />
            {rect && <span className="croprect" style={{ left: rect.x, top: rect.y, width: rect.w, height: rect.h }} />}
          </div>
        )}
        <div className="cropfoot">
          <button onClick={onCancel}>取消</button>
          <button className="primary" onClick={finish} disabled={!rect}>
            用这块
          </button>
        </div>
      </div>
    </div>
  );
}
