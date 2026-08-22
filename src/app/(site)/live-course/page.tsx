import { permanentRedirect } from "next/navigation";

export const metadata = {
  title: "Live Batch | Plickify Academy",
  alternates: { canonical: "/live-batch" },
};

export default function LiveCoursePage() {
  permanentRedirect("/live-batch");
}
