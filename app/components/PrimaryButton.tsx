"use client";

import { ReactNode, MouseEventHandler } from "react";

interface PrimaryButtonProps {
  href?: string;
  onClick?: MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  children: ReactNode;
  className?: string;
}

export default function PrimaryButton({
  href,
  onClick,
  type = "button",
  disabled = false,
  children,
  className = "",
}: PrimaryButtonProps) {
  const baseClass = `inline-flex items-center justify-center text-center px-5 py-3 rounded-md transition ${className}`;
  const baseStyle: React.CSSProperties = {
    background: "var(--primary)",
    color: "white",
    opacity: disabled ? 0.6 : 1,
    pointerEvents: disabled ? "none" : undefined,
  };

  const onEnter: MouseEventHandler<any> = (e) => {
    (e.currentTarget as HTMLElement).style.background = "var(--primary-hover)";
  };
  const onLeave: MouseEventHandler<any> = (e) => {
    (e.currentTarget as HTMLElement).style.background = "var(--primary)";
  };

  if (href && !onClick) {
    return (
      <a href={href} className={baseClass} style={baseStyle} onMouseEnter={onEnter} onMouseLeave={onLeave}>
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