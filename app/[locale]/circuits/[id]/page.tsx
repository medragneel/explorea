// app/[locale]/circuits/[id]/page.tsx
import { notFound } from 'next/navigation'
import { db } from '@/db'
import { circuits, departs } from '@/db/schema'
import { eq } from 'drizzle-orm'
import CircuitDetailClient from '@/components/CircuitDetailClient'
import { getField } from '@/lib/i18n-field'

// ── Types ─────────────────────────────────────────────────────────────────

type ItineraryDay = {
    day: number
    title: string
    location: string
    lat: number
    lng: number
    overnight: string
    description: string
    activities: string[]
    meals: string[]
    icon: string
}

type Highlight = {
    icon: string
    title: string
    desc: string
}

// ── Fallback itinerary if DB has none ────────────────────────────────────
// This is used for old circuits that don't have itinerary data yet

function generateFallbackItinerary(circuit: any): ItineraryDay[] {
    const region = (circuit.region ?? '').toLowerCase()
    const duree = circuit.duree ?? 7

    const sahara: ItineraryDay[] = [
        { day: 1, title: 'Arrivée & Accueil', location: 'Ouargla', lat: 31.9539, lng: 5.3329, overnight: 'Hôtel Transatlantique', description: "Accueil à l'aéroport par votre guide. Visite du vieux ksar, dîner traditionnel.", activities: ['Visite ksar', 'Marché local', 'Dîner'], meals: ['Dîner'], icon: '✈️' },
        { day: 2, title: 'Route des Dunes', location: 'Grand Erg', lat: 30.5, lng: 7.0, overnight: 'Bivouac de luxe', description: 'Départ en 4x4 vers le Grand Erg. Bivouac sous un ciel étoilé exceptionnel.', activities: ['4x4', 'Coucher de soleil', 'Étoiles'], meals: ['Petit-déjeuner', 'Déjeuner', 'Dîner'], icon: '🏜️' },
        { day: 3, title: 'Méharée', location: 'Erg Oriental', lat: 30.2, lng: 7.5, overnight: 'Bivouac nomade', description: 'Méharée à dos de dromadaire. Rencontre avec une famille touarègue.', activities: ['Méharée', 'Rencontre touarègue'], meals: ['Petit-déjeuner', 'Déjeuner', 'Dîner'], icon: '🐪' },
        { day: 4, title: 'Oasis', location: 'Illizi', lat: 26.509, lng: 8.4806, overnight: "Maison d'hôtes", description: "Traversée vers l'oasis. Baignade dans une source naturelle.", activities: ['Oasis', 'Baignade'], meals: ['Petit-déjeuner', 'Déjeuner', 'Dîner'], icon: '🌴' },
        { day: 5, title: 'Découverte culturelle', location: 'Djanet', lat: 24.5553, lng: 9.484, overnight: 'Hôtel Zeriba', description: 'Arrivée à Djanet. Marché traditionnel et thé touareg.', activities: ['Marché', 'Thé touareg'], meals: ['Petit-déjeuner', 'Déjeuner', 'Dîner'], icon: '🏛️' },
        { day: 6, title: 'Retour', location: 'Ouargla', lat: 31.9539, lng: 5.3329, overnight: 'Hôtel Transatlantique', description: 'Dernière matinée. Shopping artisanat. Transfert aéroport.', activities: ['Shopping', 'Transfert'], meals: ['Petit-déjeuner', 'Déjeuner'], icon: '🎁' },
    ]

    const tassili: ItineraryDay[] = [
        { day: 1, title: 'Arrivée à Djanet', location: 'Djanet', lat: 24.5553, lng: 9.484, overnight: 'Hôtel Zeriba', description: "Vol vers Djanet. Accueil touareg. Briefing trek.", activities: ['Vol', 'Accueil', 'Briefing'], meals: ['Dîner'], icon: '✈️' },
        { day: 2, title: 'Entrée Tassili', location: 'Plateau Tassili', lat: 25.0, lng: 9.8, overnight: 'Camp Cyprès', description: "Montée sur le plateau. Premières peintures rupestres.", activities: ['Ascension', 'Peintures rupestres'], meals: ['Petit-déjeuner', 'Déjeuner', 'Dîner'], icon: '🗺️' },
        { day: 3, title: 'Sefar UNESCO', location: 'Sefar', lat: 25.3, lng: 9.9, overnight: 'Bivouac Sefar', description: "Sefar, la ville fantôme. Fresques préhistoriques UNESCO.", activities: ['Sefar', 'Fresques'], meals: ['Petit-déjeuner', 'Déjeuner', 'Dîner'], icon: '🎨' },
        { day: 4, title: 'Arches naturelles', location: 'Tin Akachaker', lat: 25.5, lng: 10.1, overnight: 'Bivouac arches', description: "Arches de grès rouge. Photography golden hour.", activities: ['Arches', 'Photography'], meals: ['Petit-déjeuner', 'Déjeuner', 'Dîner'], icon: '🌅' },
        { day: 5, title: 'Oued Djerat', location: 'Oued Djerat', lat: 25.1, lng: 9.7, overnight: 'Camp Djerat', description: "Gravures rupestres géantes. Faune préhistorique.", activities: ['Gravures', 'Géologie'], meals: ['Petit-déjeuner', 'Déjeuner', 'Dîner'], icon: '🐘' },
        { day: 6, title: 'Tadrart Rouge', location: 'Tadrart', lat: 24.8, lng: 9.6, overnight: 'Bivouac Tadrart', description: "Falaises de grès rouge flamboyant. Paysages lunaires.", activities: ['Tadrart', 'Dunes'], meals: ['Petit-déjeuner', 'Déjeuner', 'Dîner'], icon: '🔴' },
        { day: 7, title: 'Retour Djanet', location: 'Djanet', lat: 24.5553, lng: 9.484, overnight: 'Vol retour', description: 'Retour à Djanet. Bijoux touaregs. Cérémonie du thé.', activities: ['Bijoux', 'Thé', 'Vol'], meals: ['Petit-déjeuner', 'Déjeuner'], icon: '🎋' },
    ]

    if (region.includes('djanet') || region.includes('tassili') || region.includes('illizi'))
        return tassili.slice(0, duree)

    return sahara.slice(0, duree)
}

function generateFallbackHighlights(circuit: any): Highlight[] {
    const stored = circuit.highlights
    if (stored && Array.isArray(stored) && stored.length > 0) return stored as Highlight[]

    const r = (circuit.region ?? '').toLowerCase()
    if (r.includes('djanet') || r.includes('tassili')) return [
        { icon: '🎨', title: 'Art rupestre UNESCO', desc: 'Plus de 15 000 peintures préhistoriques' },
        { icon: '🏔️', title: 'Plateau grandiose', desc: "Falaises de grès à 2 000m d'altitude" },
        { icon: '🌅', title: 'Couchers de soleil', desc: 'Couleurs irréelles sur la Tadrart Rouge' },
        { icon: '⭐', title: 'Ciel étoilé', desc: 'Zéro pollution lumineuse, Voie lactée visible' },
    ]
    return [
        { icon: '🐪', title: 'Méharée authentique', desc: 'Trek avec guides touarèg' },
        { icon: '⭐', title: 'Nuits sous les étoiles', desc: 'Bivouac de luxe en plein désert' },
        { icon: '🏜️', title: 'Dunes monumentales', desc: "Certaines atteignent 300m de hauteur" },
        { icon: '👥', title: 'Rencontre touarègue', desc: 'Immersion avec les nomades du désert' },
    ]
}

// ─────────────────────────────────────────────────────────────────────────

export default async function CircuitDetailPage({
    params,
}: {
    params: Promise<{ id: string; locale: string }>
}) {
    const { id, locale } = await params

    const circuit = await db.query.circuits.findFirst({
        where: eq(circuits.id, id),
    })

    if (!circuit) notFound()

    const deps = await db
        .select()
        .from(departs)
        .where(eq(departs.circuitId, id))

    // ✅ Use itinerary from DB if it exists and has days, otherwise fallback
    const dbItinerary = (circuit as any).itinerary
    const itinerary: ItineraryDay[] =
        dbItinerary && Array.isArray(dbItinerary) && dbItinerary.length > 0
            ? dbItinerary as ItineraryDay[]
            : generateFallbackItinerary(circuit)

    // ✅ Use highlights from DB if they exist, otherwise fallback
    const highlights: Highlight[] = generateFallbackHighlights(circuit)

    return (
        <CircuitDetailClient
            circuit={circuit}
            departs={deps}
            itinerary={itinerary}
            highlights={highlights}
            locale={locale}
        />
    )
}
