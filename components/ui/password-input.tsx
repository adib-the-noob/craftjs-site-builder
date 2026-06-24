"use client";

import { EyeIcon, EyeOffIcon } from "lucide-react";
import { forwardRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type PasswordInputProps = Omit<
  React.ComponentProps<typeof Input>,
  "type" | "suffix"
> & {
  /** Optional controlled visibility — useful when the parent wants to
   * force show/hide (e.g. a "view password" preference). */
  visible?: boolean;
  /** Called when the user clicks the show/hide toggle. */
  onVisibleChange?: (visible: boolean) => void;
};

/**
 * Password input with placeholder support and an inline show/hide
 * toggle. Wraps the base `Input` so styling stays consistent with
 * other form fields. Falls back to uncontrolled visibility when no
 * controlled `visible` prop is provided.
 */
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput(
    { className, visible: controlledVisible, onVisibleChange, disabled, ...props },
    ref
  ) {
    const [internalVisible, setInternalVisible] = useState(false);
    const isControlled = controlledVisible !== undefined;
    const visible = isControlled ? controlledVisible : internalVisible;

    const toggle = () => {
      if (disabled) return;
      const next = !visible;
      if (!isControlled) setInternalVisible(next);
      onVisibleChange?.(next);
    };

    return (
      <div className={cn("relative", className)}>
        <Input
          ref={ref}
          type={visible ? "text" : "password"}
          disabled={disabled}
          // Reserve space on the right so typed text never slides under
          // the toggle button.
          className="pr-10"
          {...props}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={toggle}
          disabled={disabled}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          // Pressing the toggle should not submit the surrounding form,
          // and should keep focus on the input so the user can keep typing.
          onMouseDown={(e) => e.preventDefault()}
          className="absolute top-0 right-0 h-full w-9 px-0 text-muted-foreground hover:bg-transparent hover:text-foreground"
        >
          {visible ? (
            <EyeOffIcon className="h-4 w-4" />
          ) : (
            <EyeIcon className="h-4 w-4" />
          )}
        </Button>
      </div>
    );
  }
);
