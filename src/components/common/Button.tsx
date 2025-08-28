import { ButtonHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

type Variant = "primary" | "secondary" | "outline" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  startIcon?: ReactNode;   // ← 앞쪽 아이콘
  endIcon?: ReactNode;     // ← 뒤쪽 아이콘
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  startIcon,
  endIcon,
  className,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed";

  const variants: Record<Variant, string> = {
    primary: "bg-primary text-white hover:bg-primary/90",
    secondary: "bg-secondary text-gray-800 hover:bg-gray-300",
    outline: "border border-gray-300 text-gray-700 bg-white hover:bg-gray-50",
    danger: "bg-red-500 text-white hover:bg-red-600",
  };

  const sizes: Record<Size, string> = {
    sm: "px-3 py-1.5 text-sm gap-1.5",
    md: "px-4 py-2 text-base gap-2",
    lg: "px-6 py-3 text-lg gap-2.5",
  };

  return (
    <button
      className={clsx(base, variants[variant], sizes[size], className)}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && (
        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"></span>
      )}
      {startIcon && <span className="flex items-center">{startIcon}</span>}
      {children}
      {endIcon && <span className="flex items-center">{endIcon}</span>}
    </button>
  );
}