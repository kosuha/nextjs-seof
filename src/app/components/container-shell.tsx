import type { ComponentPropsWithoutRef, ElementType } from "react";
import { cn } from "@/lib/utils";

type ContainerShellProps<T extends ElementType = "section"> = {
  as?: T;
} & ComponentPropsWithoutRef<T>;

export function ContainerShell<T extends ElementType = "section">({
  as,
  className,
  children,
  ...props
}: ContainerShellProps<T>) {
  const Component = as ?? "section";

  return (
    <Component
      className={cn(
        "mx-auto w-full max-w-6xl px-6",
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
