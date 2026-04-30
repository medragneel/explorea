// app/[locale]/page.tsx
import HeroSection from '@/components/home/HeroSection'
import StatsBar from '@/components/home/StatsBar'
import FeaturedCircuits from '@/components/home/FeaturedCircuits'
import ParallaxQuote from '@/components/home/ParallaxQuote'
import ExperiencesSection from '@/components/home/ExperiencesSection'
import TestimonialsSection from '@/components/home/TestimonialsSection'
import CTABanner from '@/components/home/CTABanner'

export default function HomePage() {
    return (
        <div className="bg-[#080604] text-[#EDE8DF] overflow-x-hidden">
            <HeroSection />
            <StatsBar />
            <FeaturedCircuits />
            <ParallaxQuote />
            <ExperiencesSection />
            <TestimonialsSection />
            <CTABanner />
        </div>
    )
}
