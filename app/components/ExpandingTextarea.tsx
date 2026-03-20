import * as React from "react";
import { cn } from "~/lib/utils";

export interface ExpandingTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Rendered in the bottom-right corner of the field (e.g. VoiceRecorder button) */
  endAdornment?: React.ReactNode;
}

/**
 * Auto-growing textarea that starts at one line and expands as content grows.
 * Uses scrollHeight measurement so it works reliably with SSR and React hydration.
 * Pass `endAdornment` to overlay a button (e.g. a microphone) inside the field.
 */
export const ExpandingTextarea = React.forwardRef<
  HTMLTextAreaElement,
  ExpandingTextareaProps
>(({ className, endAdornment, onChange, value, ...props }, forwardedRef) => {
  const innerRef = React.useRef<HTMLTextAreaElement | null>(null);

  // Merge internal ref with forwarded ref, handling both object and callback forms
  const setRef = React.useCallback(
    (el: HTMLTextAreaElement | null) => {
      innerRef.current = el;
      if (typeof forwardedRef === "function") {
        forwardedRef(el);
      } else if (forwardedRef) {
        forwardedRef.current = el;
      }
    },
    [forwardedRef]
  );

  const adjust = React.useCallback(() => {
    const el = innerRef.current;
    if (!el) return;
    // Reset then measure so shrinking works too
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  // Adjust on controlled value changes (e.g. after transcript is appended)
  React.useEffect(() => {
    adjust();
  }, [value, adjust]);

  // Adjust once on mount
  React.useEffect(() => {
    adjust();
  }, [adjust]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    adjust();
    onChange?.(e);
  };

  return (
    <div className="relative">
      <textarea
        ref={setRef}
        value={value}
        onChange={handleChange}
        rows={1}
        className={cn(
          // Base styling — matches shadcn Input
          "flex w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm",
          "placeholder:text-gray-400",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10b981] focus-visible:border-[#10b981]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500",
          // Auto-grow: no manual resize, smooth height transition
          "resize-none overflow-hidden transition-[height] duration-150 ease-out",
          // Extra right padding when there's an adornment button
          endAdornment ? "pr-10" : "",
          className
        )}
        {...props}
      />
      {endAdornment && (
        <div className="absolute bottom-2 right-2 flex items-center">
          {endAdornment}
        </div>
      )}
    </div>
  );
});

ExpandingTextarea.displayName = "ExpandingTextarea";
