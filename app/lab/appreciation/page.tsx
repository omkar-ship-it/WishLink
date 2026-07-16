import type { Metadata } from "next";
import AppreciationExperience from "./AppreciationExperience";

export const metadata: Metadata = {
  title: "For Eswari",
  description: "A five-year anniversary letter for Eswari, told as a scroll-linked cinematic reveal.",
};

export default function AppreciationLabPage() {
  return <AppreciationExperience />;
}
