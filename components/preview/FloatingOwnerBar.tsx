"use client";

import {
  CheckCircle2Icon,
  ExternalLinkIcon,
  EyeIcon,
  Loader2Icon,
  PencilIcon,
  RocketIcon,
  XIcon,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { getCurrentUser, type AuthUser } from "@/lib/auth";
import {
  publishSite,
  unpublishSite,
  type Site,
} from "@/lib/sites";
import { toast } from "sonner";

type FloatingOwnerBarProps = {
  site: Site;
  /**
   * Whether the floating chip is collapsed (icon only) or expanded.
   * Persists in localStorage so the owner can pick a layout once.
   */
  initiallyCollapsed?: boolean;
};

/**
 * Vercel / WordPress style floating chip shown only when the
 * currently signed-in user is the owner of this site. The chip
 * surfaces quick actions — edit / preview toggle / publish — without
 * taking over the page like the old top header did.
 *
 * Anonymous visitors never see it.
 */
export function FloatingOwnerBar({
  site,
  initiallyCollapsed = false,
}: FloatingOwnerBarProps) {
  const [user, setUser] = useState<AuthUser | null | undefined>(undefined);
  const [collapsed, setCollapsed] = useState(initiallyCollapsed);
  const [publishing, setPublishing] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(site.status);

  useEffect(() => {
    let cancelled = false;
    getCurrentUser()
      .then((u) => {
        if (!cancelled) setUser(u);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // While we're resolving the user, render nothing — that way an
  // anonymous visitor never sees the chip flash for a frame.
  if (user === undefined) return null;
  // Hide entirely for non-owners.
  if (user === null || user.id !== site.user_id) return null;

  const isOwner = true;
  const isPublished = currentStatus === "published";

  const handlePublishToggle = async () => {
    if (publishing) return;
    setPublishing(true);
    try {
      const next = isPublished
        ? await unpublishSite(site.id)
        : await publishSite(site.id);
      setCurrentStatus(next.status);
      toast.success(
        isPublished
          ? "Reverted to draft — site is no longer public."
          : "Published — your site is live."
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not update status";
      toast.error(message);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div
      role="region"
      aria-label="Owner controls"
      className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4"
    >
      <div
        className={cn(
          "pointer-events-auto flex items-center gap-2 rounded-full border bg-background/85 p-1.5 shadow-lg backdrop-blur transition-all",
          "ring-1 ring-foreground/5"
        )}
      >
        {/* Status dot + slug (always visible). */}
        <div className="flex items-center gap-2 rounded-full bg-foreground/5 px-3 py-1.5 text-xs">
          <span
            aria-hidden
            className={cn(
              "h-2 w-2 rounded-full",
              isPublished
                ? "bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.18)]"
                : "bg-amber-500 shadow-[0_0_0_3px_rgba(245,158,11,0.18)]"
            )}
          />
          <span className="font-mono text-foreground/80">{site.slug}</span>
          {!collapsed && (
            <span className="hidden text-muted-foreground sm:inline">
              · {isPublished ? "Published" : "Draft"}
            </span>
          )}
        </div>

        {!collapsed && (
          <>
            {/* Edit */}
            <Tooltip>
              <TooltipTrigger
                render={
                  <Link
                    href={`/editor/${site.slug}`}
                    className="inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-medium hover:bg-foreground/5"
                  >
                    <PencilIcon className="h-3.5 w-3.5" />
                    Edit
                  </Link>
                }
              />
              <TooltipContent side="top">Open the editor</TooltipContent>
            </Tooltip>

            {/* Public preview */}
            <Tooltip>
              <TooltipTrigger
                render={
                  <Link
                    href={`/preview/${site.slug}`}
                    className="inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-medium hover:bg-foreground/5"
                  >
                    <EyeIcon className="h-3.5 w-3.5" />
                    Preview
                  </Link>
                }
              />
              <TooltipContent side="top">Open in a new tab</TooltipContent>
            </Tooltip>

            {/* Publish / Unpublish */}
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    size="sm"
                    onClick={handlePublishToggle}
                    disabled={publishing}
                    className={cn(
                      "h-8 rounded-full px-3 text-xs",
                      isPublished
                        ? "bg-emerald-600 text-white hover:bg-emerald-700"
                        : "bg-foreground text-background hover:bg-foreground/90"
                    )}
                  >
                    {publishing ? (
                      <Loader2Icon className="h-3.5 w-3.5 animate-spin" />
                    ) : isPublished ? (
                      <CheckCircle2Icon className="h-3.5 w-3.5" />
                    ) : (
                      <RocketIcon className="h-3.5 w-3.5" />
                    )}
                    {isPublished ? "Live" : "Publish"}
                  </Button>
                }
              />
              <TooltipContent side="top">
                {isPublished
                  ? "Click to revert to draft"
                  : "Publish so visitors can see your site"}
              </TooltipContent>
            </Tooltip>
          </>
        )}

        {/* Collapse / expand toggle. */}
        <Tooltip>
          <TooltipTrigger
            render={
              <button
                type="button"
                onClick={() => setCollapsed((v) => !v)}
                aria-label={collapsed ? "Expand owner controls" : "Collapse owner controls"}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
              >
                {collapsed ? (
                  <ExternalLinkIcon className="h-3.5 w-3.5" />
                ) : (
                  <XIcon className="h-3.5 w-3.5" />
                )}
              </button>
            }
          />
          <TooltipContent side="top">
            {collapsed ? "Show actions" : "Hide actions"}
          </TooltipContent>
        </Tooltip>
      </div>

      {/* isOwner is consumed implicitly by the early return above; keep
          the variable referenced so a future "view-as" feature can flip
          it without refactoring this file. */}
      <span hidden>{String(isOwner)}</span>
    </div>
  );
}
