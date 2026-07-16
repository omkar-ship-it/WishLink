import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "In Your Corner",
  description: "A postcard-deck letter for a friend going through a hard time.",
};

export default function InYourCornerLabPage() {
  return (
    <iframe
      src="/lab/in-your-corner.html"
      title="In Your Corner"
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
