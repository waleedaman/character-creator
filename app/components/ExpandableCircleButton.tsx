"use client";

import React, { MouseEventHandler, ReactNode } from "react";

type Variant = "primary" | "accent" | "danger" | "neutral";

interface ExpandableCircleButtonProps {
  label: string;
  icon: ReactNode;
  ariaLabel?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  className?: string;
  disabled?: boolean;
  variant?: Variant;
}

const variantToTokens: Record<Variant, { base: string; hover: string; text: string; ring?: string }> = {
  primary: { base: "var(--primary)", hover: "var(--primary-hover)", text: "white" },
  accent: { base: "var(--accent)", hover: "var(--accent-hover)", text: "white" },
  danger: { base: "var(--danger)", hover: "var(--danger-hover)", text: "white" },
  neutral: { base: "rgba(255,255,255,0.9)", hover: "#ffffff", text: "#111827" },
};

export default function ExpandableCircleButton({
  label,
  icon,
  ariaLabel,
  onClick,
  className = "",
  disabled = false,
  variant = "primary",
}: ExpandableCircleButtonProps) {
  const tokens = variantToTokens[variant];
  const baseStyle: React.CSSProperties = {
    background: tokens.base,
    color: tokens.text,
    opacity: disabled ? 0.6 : 1,
    pointerEvents: disabled ? "none" : undefined,
  };

  const onEnter: MouseEventHandler<HTMLButtonElement> = (e) => {
    (e.currentTarget as HTMLButtonElement).style.background = tokens.hover;
  };
  const onLeave: MouseEventHandler<HTMLButtonElement> = (e) => {
    (e.currentTarget as HTMLButtonElement).style.background = tokens.base;
  };

  return (
    <button
      type="button"
      aria-label={ariaLabel || label}
      onClick={onClick}
      disabled={disabled}
      className={`group/expbtn inline-flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full shadow backdrop-blur-sm transition-all duration-300 ease-out hover:w-auto hover:px-3 focus:outline-none focus-visible:ring-2 ${className}`}
      style={baseStyle}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      {icon}
      <span className="ml-0 max-w-0 overflow-hidden whitespace-nowrap text-xs opacity-0 transition-all duration-300 group-hover/expbtn:ml-2 group-hover/expbtn:max-w-[96px] group-hover/expbtn:opacity-100">
        {label}
      </span>
    </button>
  );
}
