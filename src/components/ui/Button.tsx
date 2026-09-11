import { forwardRef, type ButtonHTMLAttributes } from "react";
export const Arrow = ({ diagonal = false }: { diagonal?: boolean }) => (
  <svg
    aria-hidden="true"
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
  >
    <path
      d={diagonal ? "M6 18 18 6M6 6h12v12" : "M4 12h15m-6-6 6 6-6 6"}
      stroke="currentColor"
      strokeWidth="1.4"
    />
  </svg>
);
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  loading?: boolean;
}
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      loading,
      className = "",
      disabled,
      ...props
    },
    ref,
  ) => (
    <button
      ref={ref}
      className={`button button-${variant} ${className}`}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {children}
      {loading ? <span className="spinner" aria-hidden="true" /> : <Arrow />}
    </button>
  ),
);
Button.displayName = "Button";
export default Button;
