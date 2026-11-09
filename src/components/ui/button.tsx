import { Button as BaseButton } from "@base-ui/react/button";
import Link from "next/link";
import type { ComponentProps } from "react";

type Variant = "primary" | "secondary" | "ember" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap select-none transition-[background-color,color,border-color,box-shadow,transform] duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink active:translate-y-px data-disabled:pointer-events-none data-disabled:opacity-45 disabled:pointer-events-none disabled:opacity-45";

const variants: Record<Variant, string> = {
  primary: "bg-ink text-white hover:bg-ink-soft shadow-[0_8px_20px_-10px_rgb(20_16_20/0.6)]",
  secondary: "border border-line-strong bg-transparent text-ink hover:border-ink hover:bg-white",
  ember: "bg-ember text-white hover:bg-ember-ink shadow-[0_8px_20px_-10px_rgb(226_85_45/0.7)]",
  ghost: "text-ink hover:bg-ink/5",
  danger: "border border-bad/30 text-bad hover:bg-bad-wash",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-[15px]",
  lg: "h-13 px-7 text-base",
};

export function buttonClass({ variant = "primary", size = "md", className = "" }: { variant?: Variant; size?: Size; className?: string } = {}) {
  return `${base} ${variants[variant]} ${sizes[size]} ${className}`;
}

type ButtonProps = ComponentProps<typeof BaseButton> & { variant?: Variant; size?: Size; className?: string };

export function Button({ variant, size, className, ...props }: ButtonProps) {
  return <BaseButton {...props} className={buttonClass({ variant, size, className })} />;
}

type LinkButtonProps = ComponentProps<typeof Link> & { variant?: Variant; size?: Size; className?: string };

export function LinkButton({ variant, size, className, ...props }: LinkButtonProps) {
  return <Link {...props} className={buttonClass({ variant, size, className })} />;
}
