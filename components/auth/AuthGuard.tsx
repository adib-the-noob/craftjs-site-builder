"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { clearToken, isAuthenticated, getCurrentUser } from "@/lib/auth";

type AuthGuardProps = {
  children: ReactNode;
};

/**
 * Client-side route guard. Redirects unauthenticated visitors to /login
 * (preserving the requested path in ?next=) and clears the token if the
 * backend rejects it with a 401.
 *
 * The check is intentionally optimistic: it lets the render proceed as soon
 * as a token exists in localStorage, then validates it in the background.
 * This avoids a flash of /login for already-authenticated users. The
 * background check transparently kicks them out if the token is stale.
 *
 * IMPORTANT: when a stale token is detected we MUST clear it from
 * localStorage. Otherwise LoginForm's `isAuthenticated()` check returns
 * true and immediately bounces the user back to `next` (= /sites), which
 * the guard then rejects again — a sites → login → sites loop.
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const [state, setState] = useState<"checking" | "ok" | "redirecting">(
    "checking"
  );

  useEffect(() => {
    let cancelled = false;

    async function check() {
      if (typeof window === "undefined") return;
      const token = isAuthenticated();
      const currentPath = window.location.pathname + window.location.search;
      if (!token) {
        if (cancelled) return;
        setState("redirecting");
        router.replace(
          `/login?next=${encodeURIComponent(currentPath)}`
        );
        return;
      }

      // Background validation — non-blocking.
      const user = await getCurrentUser().catch(() => null);
      if (cancelled) return;

      if (!user) {
        // Token was rejected — drop it so LoginForm doesn't bounce us
        // straight back here.
        clearToken();
        setState("redirecting");
        router.replace(
          `/login?next=${encodeURIComponent(currentPath)}`
        );
        return;
      }

      setState("ok");
    }

    check();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (state === "ok") return <>{children}</>;

  return (
    <div className="flex h-screen items-center justify-center text-sm text-muted-foreground">
      Loading…
    </div>
  );
}
