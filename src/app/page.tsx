import { RecentReviewsSection } from "@/app/components/recent-reviews-section";

export default function Home() {
  return (
    <div className="flex flex-col gap-16 pb-24">
      <section id="recent-reviews">
        <RecentReviewsSection />
      </section>
    </div>
  );
}
