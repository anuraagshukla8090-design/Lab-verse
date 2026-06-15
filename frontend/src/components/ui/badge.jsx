import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-blue-600/20 text-blue-300 hover:bg-blue-600/30",
        secondary:
          "border-transparent bg-slate-700 text-slate-300 hover:bg-slate-600",
        destructive:
          "border-transparent bg-red-900/30 text-red-400 hover:bg-red-900/50",
        outline:
          "border-white/20 text-slate-300 hover:bg-white/10",
        success:
          "border-transparent bg-emerald-900/30 text-emerald-400",
        warning:
          "border-transparent bg-amber-900/30 text-amber-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({ className, variant, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
