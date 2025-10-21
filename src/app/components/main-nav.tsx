"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
};

const navItems: NavItem[] = [
  { href: "/", label: "홈" },
  { href: "/reviews", label: "리뷰" },
  { href: "/buildings", label: "건물" },
];

type MainNavProps = {
  className?: string;
  onNavigate?: () => void;
};

export function MainNav({ className, onNavigate }: MainNavProps = {}) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "text-muted-foreground flex items-center gap-4 text-sm font-medium",
        className,
      )}
    >
      {navItems.map((item) => {
        const isActive =
          item.href === "/" ? pathname === item.href : pathname?.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "hover:text-foreground transition-colors",
              isActive ? "text-foreground" : undefined,
            )}
            aria-current={isActive ? "page" : undefined}
            onClick={() => {
              onNavigate?.();
            }}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
