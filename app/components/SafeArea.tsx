"use client";

import { ReactNode } from "react";

interface SafeAreaProps {
  children: ReactNode;
  className?: string;
}

/** Uses CSS safe-area env vars (standard web / in-app browser). */
export function SafeArea({ children, className }: SafeAreaProps) {
  return (
    <div
      className={className}
      style={{
        paddingTop: "env(safe-area-inset-top, 0px)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        paddingLeft: "env(safe-area-inset-left, 0px)",
        paddingRight: "env(safe-area-inset-right, 0px)",
      }}
    >
      {children}
    </div>
  );
}
