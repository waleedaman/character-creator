"use client";

import { ReactNode, MouseEventHandler } from "react";

interface AccentButtonProps {
  href?: string;
  onClick?: MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  children: ReactNode;
  className?: string;
  target?: string;
  rel?: string;
}

export default function AccentButton({
  href,
  onClick,
  type = "button",
  disabled = false,
  children,
  className = "",
  target,
  rel,
}: AccentButtonProps) {
  const baseClass = `inline-flex items-center justify-center text-center px-4 py-2 rounded-md text-white transition ${className}`;
  const baseStyle: React.CSSProperties = {
    background: "var(--accent)",
    opacity: disabled ? 0.6 : 1,
    pointerEvents: disabled ? "none" : undefined,
  };
  const onEnter: MouseEventHandler<any> = (e) => {
    (e.currentTarget as HTMLElement).style.background = "var(--accent-hover)";
  };
  const onLeave: MouseEventHandler<any> = (e) => {
    (e.currentTarget as HTMLElement).style.background = "var(--accent)";
  };

  if (href && !onClick) {
    return (
      <a
        href={href}
        target={target}
        rel={rel}
        className={baseClass}
        style={baseStyle}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
      >
        {children}
      </a>
    );
  }
  return (
    <button
      type={type}
      onClick={onClick as MouseEventHandler<HTMLButtonElement>}
      className={baseClass}
      style={baseStyle}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      disabled={disabled}
    >
      {children}
    </button>
  );
}