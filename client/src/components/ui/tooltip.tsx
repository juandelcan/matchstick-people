import { createContext, useContext, useState, type ReactNode } from "react";

/**
 * Minimal stand-in for the shadcn/Radix tooltip the original build used.
 * The site only mounts TooltipProvider at the root and never renders a tooltip,
 * so this keeps the API shape without pulling in Radix.
 */
const TooltipCtx = createContext<{ open: boolean; setOpen: (v: boolean) => void }>({
  open: false,
  setOpen: () => {},
});

export function TooltipProvider({ children }: { children: ReactNode; delayDuration?: number }) {
  return <>{children}</>;
}

export function Tooltip({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return <TooltipCtx.Provider value={{ open, setOpen }}>{children}</TooltipCtx.Provider>;
}

export function TooltipTrigger({ children }: { children: ReactNode; asChild?: boolean }) {
  const { setOpen } = useContext(TooltipCtx);
  return (
    <span onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      {children}
    </span>
  );
}

export function TooltipContent({ children }: { children: ReactNode }) {
  const { open } = useContext(TooltipCtx);
  if (!open) return null;
  return (
    <span style={{
      position: "absolute", zIndex: 60, background: "#0D0C0A", color: "#F5F0E8",
      padding: "0.4rem 0.7rem", fontSize: "0.72rem", fontFamily: "'DM Mono', monospace",
      whiteSpace: "nowrap",
    }}>
      {children}
    </span>
  );
}
