import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

const variants = {
  primary:
    "bg-brand text-white hover:bg-brand-600 shadow-sm disabled:bg-slate-300",
  secondary:
    "bg-white text-ink border border-line hover:bg-paper disabled:text-slate-400",
  ghost: "bg-transparent text-ink hover:bg-paper",
  danger: "bg-danger text-white hover:bg-red-800",
} as const;

const sizes = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-5 text-base",
} as const;

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}
