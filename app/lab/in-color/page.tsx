import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "In Color",
  description: "A colorful, photo-driven scene-by-scene letter of appreciation, from wife to husband.",
};

export default function InColorLabPage() {
  return (
    <iframe
      src="/lab/in-color.html"
      title="In Color"
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        border: "none",
      }}
      allow="autoplay"
    />
  );
}
