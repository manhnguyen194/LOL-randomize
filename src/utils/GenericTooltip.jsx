import { createPortal } from "react-dom";
import useSmartTooltipPosition from "./useSmartTooltipPosition";
import { useRef, useEffect, useState } from "react";

/**
 * GenericTooltip (portal) — cập nhật vị trí khi parent di chuyển/scroll/resize.
 *
 * Lưu ý: parentRef phải là element mà tooltip căn vào.
 */

function findScrollParent(node) {
  if (!node) return window;
  let el = node.parentElement;
  while (el) {
    const { overflowY, overflow, overflowX } = getComputedStyle(el);
    if (
      /(auto|scroll|overlay)/.test(overflowY + overflow + overflowX)
    ) {
      return el;
    }
    el = el.parentElement;
  }
  return window;
}

export default function GenericTooltip({
  type,
  data,
  parentRef,
  onMouseEnter,
  onMouseLeave,
}) {
  if (!data || !parentRef?.current) return null;

  const tooltipRef = useRef(null);
  const rafRef = useRef(null);
  const resizeObsRef = useRef(null);
  const [root, setRoot] = useState(null);
  const [pos, setPos] = useState({ top: 0, left: 0, anchorMiddleX: 0, placement: "below" });

  // create/get portal root
  useEffect(() => {
    let el = document.getElementById("tooltip-root");
    if (!el) {
      el = document.createElement("div");
      el.id = "tooltip-root";
      document.body.appendChild(el);
    }
    setRoot(el);
  }, []);

  // smart positioning helper (keeps using your existing util for translateX/above/below decision)
  const { verticalPosition, translateX } = useSmartTooltipPosition(parentRef, 288);

  // calc position once — compute top/left based on parent rect and viewport
  const calcPosition = () => {
    const p = parentRef.current;
    if (!p) return;

    const rect = p.getBoundingClientRect();
    const tooltipWidth = 288; // approx width (18rem). we also use translateX to shift.
    const anchorMiddleX = rect.left + rect.width / 2;

    // place above or below with small margin
    const margin = 8;
    const placement = verticalPosition === "above" ? "above" : "below";
    const top =
      placement === "above"
        ? rect.top - margin
        : rect.bottom + margin;

    setPos({
      top,
      left: anchorMiddleX,
      anchorMiddleX,
      placement,
    });
  };

  useEffect(() => {
    // initial calc
    calcPosition();

    // find scroll parent(s) to listen to
    const scrollParent = findScrollParent(parentRef.current);
    const scrollTargets = new Set([window, document, scrollParent]);

    const onScrollOrResize = () => {
      // throttle with RAF
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        calcPosition();
      });
    };

    // attach listeners
    window.addEventListener("resize", onScrollOrResize, { passive: true });
    window.addEventListener("scroll", onScrollOrResize, { passive: true, capture: true });
    document.addEventListener("scroll", onScrollOrResize, { passive: true, capture: true });
    if (scrollParent && scrollParent !== window) {
      scrollParent.addEventListener("scroll", onScrollOrResize, { passive: true });
    }

    // observe parent size / position changes
    if (window.ResizeObserver && parentRef.current) {
      resizeObsRef.current = new ResizeObserver(onScrollOrResize);
      try {
        resizeObsRef.current.observe(parentRef.current);
      } catch (e) {
        // ignore
      }
    }

    // safety: also poll a few frames on mount to catch transforms/animations
    let frames = 0;
    const poll = () => {
      calcPosition();
      frames += 1;
      if (frames < 5) requestAnimationFrame(poll);
    };
    poll();

    return () => {
      // cleanup
      window.removeEventListener("resize", onScrollOrResize, { capture: true });
      window.removeEventListener("scroll", onScrollOrResize, { capture: true });
      document.removeEventListener("scroll", onScrollOrResize, { capture: true });
      if (scrollParent && scrollParent !== window) {
        scrollParent.removeEventListener("scroll", onScrollOrResize, { capture: true });
      }
      if (resizeObsRef.current && parentRef.current) {
        try {
          resizeObsRef.current.unobserve(parentRef.current);
        } catch (e) {}
        resizeObsRef.current.disconnect();
      }
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parentRef.current, verticalPosition]);

  // build HTML
  let html = "";
  if (type === "item") {
    const gold = data.gold?.total ?? 0;
    const tags = (data.tags || []).join(", ") || "Không có tag";
    const passives = [...(data.description?.matchAll(/<passive>(.*?)<\/passive>/g) ?? [])]
      .map((m) => m[1]?.trim())
      .filter(Boolean);

    html = `
      <div style="font-size:13px;line-height:1.4;">
        <b style="font-size:14px;">${data.name}</b><br/>
        ${data.description || data.plaintext || ""}<br/>
        ${
          passives.length
            ? `<b style="color:#7dd3fc;">Duy nhất:</b> ${passives.join(", ")}<br/>`
            : ""
        }
        <b>Giá:</b> ${gold}<br/>
        <b>Tags:</b> ${tags}
      </div>
    `;
  } else if (type === "spell") {
    html = `
      <div style="font-size:13px;line-height:1.4;">
        <b style="font-size:14px;">${data.name}</b><br/>
        ${data.description || data.tooltip || ""}<br/><br/>
        <b>Cooldown:</b> ${data.cooldown ?? "?"} giây
      </div>
    `;
  } else if (type === "rune" || type === "stat") {
    html = `
      <div style="font-size:13px;line-height:1.4;">
        <b style="font-size:14px;">${data.name}</b><br/>
        ${data.longDesc || data.shortDesc || data.description || ""}
      </div>
    `;
  }

  if (!root) return null;

  // dùng translateX chính từ useSmartTooltipPosition (không khai báo lại)
  const style = {
    position: "fixed",
    top: pos.placement === "above" ? pos.top - 8 : pos.top + 0,
    left: pos.left,
    // translateX đang là số (%) từ hook → ta gộp với translateX(-50%) để căn giữa
    transform: `translateX(${translateX}%) translateX(-50%)`,
    width: "18rem",
    maxWidth: "90vw",
    zIndex: 99999,
    pointerEvents: "auto",
  };


  return createPortal(
    <div
      ref={tooltipRef}
      className="bg-gray-900 text-white text-xs p-3 rounded-lg shadow-xl border border-gray-700"
      style={style}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      dangerouslySetInnerHTML={{ __html: html }}
    />,
    root
  );
}
