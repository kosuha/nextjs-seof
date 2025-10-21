import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ContainerShell } from "@/app/components/container-shell";
import { RecentReviewsSection } from "@/app/components/recent-reviews-section";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col gap-16 pb-24">
      <section id="recent-reviews">
        <RecentReviewsSection />
      </section>
    </div>
  );
}
