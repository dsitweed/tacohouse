'use client';

import {
  BenefitsSection,
  FeaturedLandlordsSection,
  GuestFooter,
  GuestHeader,
  HeroSection,
  PopularAreasSection,
  RentalGuidesSection,
  ReviewsAndFaqSection,
  RoomDiscoverySection,
} from '@/features/guest-dashboard';

export default function HomePage() {
  return (
    <div>
      {/* Top Navigation Bar */}
      <GuestHeader />

      {/* Hero Section */}
      <HeroSection />

      {/* Guest Value Proposition Highlights */}
      <BenefitsSection />

      {/* Discovery Feed & Room Cards */}
      <RoomDiscoverySection />

      {/* SECTION 2: Chủ trọ tiêu biểu & Uy tín (Featured Landlords) */}
      <FeaturedLandlordsSection />

      {/* SECTION 3: Khu vực phổ biến (Popular Areas - SEO theo khu vực) */}
      <PopularAreasSection />

      {/* SECTION 4: Cẩm nang & Kinh nghiệm thuê phòng (Rental Guides) */}
      <RentalGuidesSection />

      {/* SECTION 5: Đánh giá thực tế & FAQ */}
      <ReviewsAndFaqSection />

      {/* Footer */}
      <GuestFooter />
    </div>
  );
}
