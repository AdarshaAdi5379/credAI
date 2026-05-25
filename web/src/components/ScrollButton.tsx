"use client";

import { Button } from "@/components/Button";

export function ScrollButton({ href, children, variant, className }: { href: string; children: React.ReactNode; variant?: "primary" | "secondary" | "ghost"; className?: string }) {
  return (
    <Button
      type="button"
      variant={variant}
      className={className}
      onClick={() => document.getElementById(href.replace("#", ""))?.scrollIntoView({ behavior: "smooth" })}
    >
      {children}
    </Button>
  );
}
