// app/[locale]/page.tsx
import dynamic from 'next/dynamic'
import HeroSection from '@/components/home/HeroSection'       // ← keep static (above fold)
import StatsBar from '@/components/home/StatsBar'           // ← keep static (above fold)
import FeaturedCircuits from '@/components/home/FeaturedCircuits'   // ← keep static (above fold)

// Everything below the fold → lazy load
const ParallaxQuote = dynamic(() => import('@/components/home/ParallaxQuote'))
const ExperiencesSection = dynamic(() => import('@/components/home/ExperiencesSection'))
const TestimonialsSection = dynamic(() => import('@/components/home/TestimonialsSection'))
const CTABanner = dynamic(() => import('@/components/home/CTABanner'))

export default async function HomePage() {
    return (
        <main>
            <HeroSection />
            <StatsBar />
            <FeaturedCircuits />
            <ParallaxQuote />
            <ExperiencesSection />
            <TestimonialsSection />
            <CTABanner />
        </main>
    )
}
