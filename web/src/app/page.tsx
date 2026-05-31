// web/src/app/page.tsx
import { MarketingHero } from "@/components/sections/marketing-hero";
import { MarketingDocs } from "@/components/sections/marketing-docs";

export default function HomePage() {
  return (
    <>
      <MarketingHero />
      <MarketingDocs />
    </>
  );
}