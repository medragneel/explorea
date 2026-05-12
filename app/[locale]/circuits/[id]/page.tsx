// app/[locale]/circuits/[id]/page.tsx
import { notFound } from 'next/navigation'
import { db } from '@/db'
import { circuits, departs } from '@/db/schema'
import { eq } from 'drizzle-orm'
import CircuitDetailClient from '@/components/CircuitDetailClient'

// ── Static itinerary data per region ──────────────────────────────────────
// Since circuits table has no itinerary column yet, we generate it from region
function generateItinerary(circuit: any) {
    const region = circuit.region?.toLowerCase() ?? ''
    const duree = circuit.duree ?? 7

    const sahara = [
        { day: 1, title: 'Arrivée & Ouargla', location: 'Ouargla', lat: 31.9539, lng: 5.3329, overnight: 'Hôtel Transatlantique Ouargla', description: "Accueil à l'aéroport d'Ouargla par votre guide. Visite du vieux ksar et du musée du Sahara. Dîner traditionnel avec musique locale.", activities: ['Visite du musée', 'Marché local', 'Dîner traditionnel'], meals: ['Dîner'], icon: '✈️' },
        { day: 2, title: 'Route des Dunes', location: 'Erg Oriental', lat: 30.5000, lng: 7.0000, overnight: 'Bivouac de luxe', description: 'Départ en 4x4 vers le Grand Erg Oriental. Arrêts pour photographier les formations dunaires. Premier bivouac sous un ciel étoilé exceptionnel.', activities: ['4x4 dans les dunes', 'Coucher de soleil', 'Observation des étoiles'], meals: ['Petit-déjeuner', 'Déjeuner', 'Dîner'], icon: '🏜️' },
        { day: 3, title: 'Méharée au lever du soleil', location: 'Grand Erg', lat: 30.2000, lng: 7.5000, overnight: 'Bivouac nomade', description: 'Réveil aux aurores pour une méharée à dos de dromadaire. Rencontre avec une famille touarègue. Atelier de calligraphie dans le sable.', activities: ['Méharée', 'Rencontre touarègue', 'Calligraphie'], meals: ['Petit-déjeuner', 'Déjeuner', 'Dîner'], icon: '🐪' },
        { day: 4, title: "Oasis d'Illizi", location: 'Illizi', lat: 26.5090, lng: 8.4806, overnight: 'Maison d\'hôtes Tafaska', description: "Traversée vers l'oasis d'Illizi. Visite de la palmeraie et des jardins secrets. Baignade dans une source naturelle.", activities: ['Visite oasis', 'Baignade naturelle', 'Jardins sahariens'], meals: ['Petit-déjeuner', 'Déjeuner', 'Dîner'], icon: '🌴' },
        { day: 5, title: 'Tassili aperçu', location: 'Djanet', lat: 24.5553, lng: 9.4840, overnight: 'Hôtel Zeriba', description: 'Arrivée à Djanet, porte du Tassili. Visite du marché traditionnel et dégustation de thé touareg. Préparation pour la randonnée du lendemain.', activities: ['Marché de Djanet', 'Thé touareg', 'Briefing randonnée'], meals: ['Petit-déjeuner', 'Déjeuner', 'Dîner'], icon: '🏛️' },
        { day: 6, title: 'Retour & Souvenirs', location: 'Ouargla', lat: 31.9539, lng: 5.3329, overnight: 'Hôtel Transatlantique', description: 'Dernière matinée libre pour achats de souvenirs artisanaux. Déjeuner d\'adieu avec l\'équipe. Transfert vers l\'aéroport.', activities: ['Shopping artisanat', 'Photo souvenir', 'Transfert aéroport'], meals: ['Petit-déjeuner', 'Déjeuner'], icon: '🎁' },
    ]

    const tassili = [
        { day: 1, title: 'Arrivée à Djanet', location: 'Djanet', lat: 24.5553, lng: 9.4840, overnight: 'Hôtel Zeriba Djanet', description: "Vol vers Djanet, la perle du Sud. Accueil en musique par des musiciens touarèg. Briefing complet sur le trek Tassili par votre guide archéologue.", activities: ['Vol Djanet', 'Accueil musical', 'Briefing trek'], meals: ['Dîner'], icon: '✈️' },
        { day: 2, title: 'Entrée dans le Tassili', location: 'Plateau Tassili', lat: 25.0000, lng: 9.8000, overnight: 'Camp Cyprès', description: "Montée sur le plateau par la piste des Touaregs. Premières peintures rupestres — des scènes de vie vieilles de 10 000 ans. Bivouac sous les cyprès du Sahara, espèce rarissime.", activities: ['Ascension plateau', 'Peintures rupestres', 'Cyprès sahariens'], meals: ['Petit-déjeuner', 'Déjeuner', 'Dîner'], icon: '🗺️' },
        { day: 3, title: 'Galerie de Sefar', location: 'Sefar', lat: 25.3000, lng: 9.9000, overnight: 'Bivouac Sefar', description: 'Sefar, la "ville fantôme" du Tassili. Des milliers de fresques rupestres classées UNESCO. Votre archéologue décrypte les scènes de chasse et de vie pastorale préhistorique.', activities: ['Sefar UNESCO', 'Décryptage fresques', 'Randonnée canyons'], meals: ['Petit-déjeuner', 'Déjeuner', 'Dîner'], icon: '🎨' },
        { day: 4, title: 'Arches de Tin Akachaker', location: 'Tin Akachaker', lat: 25.5000, lng: 10.1000, overnight: 'Bivouac arches', description: "Les arches naturelles de grès rouge, sculptées par des millions d'années d'érosion. Photography golden hour inoubliable. Nuit sous les étoiles du Sahara.", activities: ['Arches naturelles', 'Photography', 'Coucher de soleil'], meals: ['Petit-déjeuner', 'Déjeuner', 'Dîner'], icon: '🌅' },
        { day: 5, title: 'Oued Djerat', location: 'Oued Djerat', lat: 25.1000, lng: 9.7000, overnight: 'Camp Djerat', description: "L'oued Djerat abrite la plus grande concentration de gravures rupestres au monde. Des éléphants, girafes et hippopotames gravés — preuve que le Sahara était verdoyant.", activities: ['Gravures géantes', 'Faune préhistorique', 'Géologie'], meals: ['Petit-déjeuner', 'Déjeuner', 'Dîner'], icon: '🐘' },
        { day: 6, title: 'Tadrart Rouge aperçu', location: 'Tadrart', lat: 24.8000, lng: 9.6000, overnight: 'Bivouac Tadrart', description: "Descente vers la Tadrart, les falaises de grès rouge flamboyant. Paysages martiaux, couleurs irréelles. Le photographe en vous sera comblé.", activities: ['Tadrart Rouge', 'Paysages lunaires', 'Dunes d\'Erg Admer'], meals: ['Petit-déjeuner', 'Déjeuner', 'Dîner'], icon: '🔴' },
        { day: 7, title: 'Retour Djanet & Départ', location: 'Djanet', lat: 24.5553, lng: 9.4840, overnight: 'Vol retour', description: 'Descente du plateau, retour à Djanet. Marché des bijoux touaregs. Cérémonie de thé d\'adieu. Vol retour chargé de souvenirs impérissables.', activities: ['Bijoux touaregs', 'Thé adieu', 'Vol retour'], meals: ['Petit-déjeuner', 'Déjeuner'], icon: '🎋' },
    ]

    const nord = [
        { day: 1, title: 'Alger la Blanche', location: 'Alger', lat: 36.7372, lng: 3.0865, overnight: 'El Djazaïr Hotel', description: "Arrivée dans la capitale. Découverte de la Casbah ottomane classée UNESCO — ruelles labyrinthiques, palais décorés, terrasses sur la baie. Déjeuner au Bardo.", activities: ['Casbah UNESCO', 'Musée du Bardo', 'Baie d\'Alger'], meals: ['Déjeuner', 'Dîner'], icon: '🏛️' },
        { day: 2, title: 'Tipaza Romaine', location: 'Tipaza', lat: 36.5897, lng: 2.4475, overnight: 'Villa Tipaza', description: "Les ruines romaines de Tipaza au bord de la Méditerranée — un contraste saisissant. Site classé UNESCO. Baignade dans les criques secrètes de la côte.", activities: ['Ruines romaines', 'Plage secrète', 'Coucher mer'], meals: ['Petit-déjeuner', 'Déjeuner', 'Dîner'], icon: '🏛️' },
        { day: 3, title: 'Route de la Soummam', location: 'Béjaïa', lat: 36.7515, lng: 5.0564, overnight: 'Hôtel Yemma Gouraya', description: "Route panoramique à travers la Grande Kabylie. Arrivée à Béjaïa, la perle méditerranéenne. Cap Carbon, les gorges de Kherrata.", activities: ['Grande Kabylie', 'Cap Carbon', 'Gorges Kherrata'], meals: ['Petit-déjeuner', 'Déjeuner', 'Dîner'], icon: '⛰️' },
    ]

    const cultural = [
        { day: 1, title: 'Ghardaïa & le M\'Zab', location: 'Ghardaïa', lat: 32.4909, lng: 3.6736, overnight: 'Maison Braham', description: "Plongée dans la vallée du M'Zab, chef-d'œuvre architectural mozabite classé UNESCO. Les cinq ksour perchés — Ghardaïa, Beni Isguen, Melika, El Atteuf, Bounoura.", activities: ['5 ksour UNESCO', 'Architecture mozabite', 'Marché couvert'], meals: ['Déjeuner', 'Dîner'], icon: '🕌' },
        { day: 2, title: 'Beni Isguen la Sainte', location: 'Beni Isguen', lat: 32.4700, lng: 3.6600, overnight: 'Maison Braham', description: "Beni Isguen, la cité sainte. Accès uniquement en groupe guidé. Ventes aux enchères traditionnelles au coucher du soleil — spectacle unique au monde.", activities: ['Cité sainte', 'Vente aux enchères', 'Artisanat ibadite'], meals: ['Petit-déjeuner', 'Déjeuner', 'Dîner'], icon: '⚖️' },
        { day: 3, title: 'El Oued la Soufiste', location: 'El Oued', lat: 33.3682, lng: 6.8573, overnight: 'Hôtel Mehri', description: "El Oued, la ville aux mille coupoles. Architecture à coupoles unique, palmeraies en cuvettes, musée Nasr. Coucher de soleil depuis les dunes voisines.", activities: ['Mille coupoles', 'Palmeraies', 'Musée Nasr'], meals: ['Petit-déjeuner', 'Déjeuner', 'Dîner'], icon: '🕍' },
    ]

    if (region.includes('djanet') || region.includes('tassili') || region.includes('illizi')) return tassili.slice(0, duree)
    if (region.includes('alger') || region.includes('béjaïa') || region.includes('oran')) return nord.slice(0, duree)
    if (region.includes('ghardaïa') || region.includes('m\'zab') || region.includes('constantine')) return cultural.slice(0, duree)
    return sahara.slice(0, duree)
}

function generateHighlights(region: string) {
    const r = region?.toLowerCase() ?? ''
    if (r.includes('djanet') || r.includes('tassili')) return [
        { icon: '🎨', title: 'Art rupestre UNESCO', desc: 'Plus de 15 000 peintures préhistoriques' },
        { icon: '🏔️', title: 'Plateau grandiose', desc: 'Falaises de grès à 2 000m d\'altitude' },
        { icon: '🌅', title: 'Couchers de soleil', desc: 'Couleurs irréelles sur la Tadrart Rouge' },
        { icon: '⭐', title: 'Ciel étoilé exceptionnel', desc: 'Zéro pollution lumineuse, Voie lactée visible' },
    ]
    return [
        { icon: '🐪', title: 'Méharée authentique', desc: 'Trek à dos de dromadaire avec guides touarèg' },
        { icon: '⭐', title: 'Nuits sous les étoiles', desc: 'Bivouac de luxe au cœur des dunes' },
        { icon: '🏜️', title: 'Dunes monumentales', desc: 'Certaines atteignent 300 mètres de hauteur' },
        { icon: '👥', title: 'Rencontre touarègue', desc: 'Immersion avec les nomades du désert' },
    ]
}

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

    const itinerary = generateItinerary(circuit)
    const highlights = generateHighlights(circuit.region ?? '')

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
