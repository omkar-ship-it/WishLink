import type { Metadata } from "next";
import KeepsakeExperience from "./KeepsakeExperience";

export const metadata: Metadata = {
  title: "A Keepsake for Chinni",
  description:
    "A five-year anniversary letter for Eswari, rendered as a real 3D scene — an orbiting ring of memories you can look around in WebGL.",
};

export default function KeepsakeLabPage() {
  return <KeepsakeExperience />;
}
