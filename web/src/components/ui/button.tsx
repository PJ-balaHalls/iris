// web/src/components/ui/button.tsx
import Link from "next/link";
import { Slot } from "@radix-ui/react-slot";
import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "rounded-full border text-sm font-medium",
    "transition-[background,color,border-color,box-shadow,transform] duration-150",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2",
    "focus-visible:ring-offset-background",
    "disabled:pointer-events-none disabled:opacity-50",
    "active:scale-[0.99]",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
  ],
  {
    variants: {
      variant: {
        primary: [
          "border-accent bg-accent text-accent-foreground shadow-irisSm",
          "hover:border-accent-subtle hover:bg-accent-subtle"
        ],
        secondary: [
          "border-border bg-surface text-foreground shadow-irisSm",
          "hover:border-accent hover:text-accent"
        ],
        outline: [
          "border-border bg-transparent text-foreground",
          "hover:border-accent hover:bg-surface hover:text-accent"
        ],
        ghost: [
          "border-transparent bg-transparent text-foreground-secondary",
          "hover:bg-surface hover:text-foreground"
        ],
        emotion: [
          "border-emotion bg-emotion text-white shadow-irisSm",
          "hover:brightness-95"
        ],
        danger: [
          "border-danger bg-danger text-white shadow-irisSm",
          "hover:brightness-95"
        ]
      },
      size: {
        sm: "h-9 px-4 text-xs",
        md: "h-11 px-5 text-sm",
        lg: "h-12 px-6 text-base",
        icon: "size-11 p-0"
      },
      fullWidth: {
        true: "w-full",
        false: ""
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      fullWidth: false
    }
  }
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, asChild = false, type = "button", ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref}
        type={asChild ? undefined : type}
        className={cn(buttonVariants({ variant, size, fullWidth }), className)}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export type ButtonLinkProps = React.ComponentProps<typeof Link> &
  VariantProps<typeof buttonVariants> & {
    className?: string;
  };

export function ButtonLink({
  className,
  variant,
  size,
  fullWidth,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={cn(buttonVariants({ variant, size, fullWidth }), className)}
      {...props}
    />
  );
}
