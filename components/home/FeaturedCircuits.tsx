// components/home/FeaturedCircuits.tsx
import FeaturedCircuitsClient from '@/components/home/FeaturedCircuitsClient'
import { getFeaturedCircuits } from '@/db/queries/circuits'

// ── Server component — fetches featured circuits from DB ──────────────────
export default async function FeaturedCircuits() {
    const featured = await getFeaturedCircuits()
    console.log(featured)

    return <FeaturedCircuitsClient circuits={featured} />
}
