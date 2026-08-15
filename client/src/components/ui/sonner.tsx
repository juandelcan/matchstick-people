import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      position="bottom-right"
      toastOptions={{
        style: {
          background: "#0D0C0A",
          color: "#F5F0E8",
          border: "none",
          borderRadius: 0,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: "0.85rem",
        },
      }}
    />
  );
}

export { toast } from "sonner";
