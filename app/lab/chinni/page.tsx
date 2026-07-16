import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "For Chinni",
  description: "A five-year anniversary letter for Eswari.",
};

export default function ChinniLabPage() {
  return (
    <iframe
      src="/lab/chinni.html"
      title="For Chinni"
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
