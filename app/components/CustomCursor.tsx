"use client";

import { useEffect, useState } from "react";

type CursorState = {
  x: number;
  y: number;
  visible: boolean;
  variant: "default" | "interactive";
};

const INTERACTIVE_SELECTOR = [
  "a",
  "button",
  "[role='button']",
  "input[type='submit']",
  "input[type='button']",
  "[data-cursor='interactive']",
].join(", ");

export default function CustomCursor() {
  const [cursor, setCursor] = useState<CursorState>({
    x: 0,
    y: 0,
    visible: false,
    variant: "default",
  });

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia("(pointer: fine)").matches) {
      return;
    }

    document.body.classList.add("custom-cursor-enabled");

    const handleMove = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target.closest(INTERACTIVE_SELECTOR) : null;

      setCursor({
        x: event.clientX,
        y: event.clientY,
        visible: true,
        variant: target ? "interactive" : "default",
      });
    };

    const handleLeave = () => {
      setCursor((current) => ({
        ...current,
        visible: false,
      }));
    };

    const handleEnter = () => {
      setCursor((current) => ({
        ...current,
        visible: true,
      }));
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseleave", handleLeave);
    window.addEventListener("mouseenter", handleEnter);

    return () => {
      document.body.classList.remove("custom-cursor-enabled");
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseleave", handleLeave);
      window.removeEventListener("mouseenter", handleEnter);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className={`custom-cursor ${cursor.visible ? "is-visible" : ""} ${cursor.variant === "interactive" ? "is-interactive" : ""}`}
      style={{
        transform: `translate3d(${cursor.x}px, ${cursor.y}px, 0)`,
      }}
    >
      <span className="custom-cursor__halo" />
      <span className="custom-cursor__core" />
      <span className="custom-cursor__spark" />
    </div>
  );
}
