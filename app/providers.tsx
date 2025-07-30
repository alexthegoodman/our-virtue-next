"use client";

import { useRouter } from "next/navigation";
import { ReactNode } from "react";
import { RouterProvider } from "react-aria-components";
import { AuthProvider } from "@/hooks/useAuth";

declare module "react-aria-components" {
  interface RouterConfig {
    routerOptions: NonNullable<
      Parameters<ReturnType<typeof useRouter>["push"]>[1]
    >;
  }
}

export function ClientProviders({ children }: { children: ReactNode }) {
  let router = useRouter();

  return (
    <RouterProvider navigate={router.push}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </RouterProvider>
  );
}
