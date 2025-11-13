import { useState, useEffect } from "react";

/**
 * 🔧 Hook định vị tooltip thông minh
 * @param {React.RefObject} parentRef - phần tử gốc (nơi hover)
 * @param {number} tooltipWidth - chiều rộng tooltip (mặc định 288px ~ w-72)
 */
export default function useSmartTooltipPosition(parentRef, tooltipWidth = 288) {
  const [position, setPosition] = useState({
    verticalPosition: "top-full mt-1",
    translateX: -50,
  });

  useEffect(() => {
    function updatePosition() {
      if (!parentRef?.current) return;

      const rect = parentRef.current.getBoundingClientRect();
      const spaceAbove = rect.top;
      const spaceBelow = window.innerHeight - rect.bottom;
      const showAbove = spaceAbove > spaceBelow;

      const screenWidth = window.innerWidth;
      const centerX = rect.left + rect.width / 2;
      const tooltipLeftEdge = centerX - tooltipWidth / 2;
      const tooltipRightEdge = centerX + tooltipWidth / 2;

      const overflowLeft = Math.max(0, -tooltipLeftEdge);
      const overflowRight = Math.max(0, tooltipRightEdge - screenWidth);

      let translateX = -50;
      if (overflowLeft > 0) translateX += (overflowLeft / tooltipWidth) * 100;
      else if (overflowRight > 0)
        translateX -= (overflowRight / tooltipWidth) * 100;

      setPosition({
        verticalPosition: showAbove ? "bottom-full mb-1" : "top-full mt-1",
        translateX,
      });
    }

    updatePosition();
    window.addEventListener("resize", updatePosition);
    return () => window.removeEventListener("resize", updatePosition);
  }, [parentRef, tooltipWidth]);

  return position;
}
