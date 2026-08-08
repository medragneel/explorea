// app/[locale]/destinations/page.tsx
import { db } from '@/db'
import { countries, circuits } from '@/db/schema'
import { eq, sql } from 'drizzle-orm'
import DestinationsClient from '@/components/DestinationsClient'
import type { Metadata } from 'next'

const BASE =  process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'


export async function generateMetadata_DestinationsPage({
    params,
}: {
    params: Promise<{ locale: string }>
}): Promise<Metadata> {
    const { locale } = await params

    const titles: Record<string, string> = {
        fr: 'Destinations — Explorez le Monde avec Explorea',
        en: 'Destinations — Explore the World with Explorea',
        ar: 'الوجهات — اكتشف العالم مع إكسبلوريا',
    }
    const descs: Record<string, string> = {
        fr: 'Voyagez en Algérie, au Maroc, en Tunisie et dans le monde entier avec Explorea. Des circuits authentiques guidés par des experts locaux.',
        en: 'Travel to Algeria, Morocco, Tunisia and worldwide with Explorea. Authentic circuits guided by local experts.',
        ar: 'سافر إلى الجزائر والمغرب وتونس وحول العالم مع إكسبلوريا. جولات أصيلة بإرشاد خبراء محليين.',
    }

    return {
        title: titles[locale] ?? titles.fr,
        description: descs[locale] ?? descs.fr,
        alternates: {
            canonical: `${BASE}/${locale}/destinations`,
            languages: { fr: `${BASE}/fr/destinations`, ar: `${BASE}/ar/destinations`, en: `${BASE}/en/destinations` },
        },
        openGraph: {
            title: titles[locale] ?? titles.fr,
            description: descs[locale] ?? descs.fr,
            url: `${BASE}/${locale}/destinations`,
            images: [{ url: `${BASE}/og-destinations.jpg`, width: 1200, height: 630 }],
        },
    }
}



export default async function DestinationsPage() {
    // Fetch countries with circuit count
    const allCountries = await db
        .select({
            id: countries.id,
            code: countries.code,
            name: countries.name,
            continent: countries.continent,
            currency: countries.currency,
            flag: countries.flag,
            image: countries.image,
            actif: countries.actif,
        })
        .from(countries)
        .where(eq(countries.actif, true))

    // Fetch circuit counts per country
    const circuitCounts = await db
        .select({
            countryId: circuits.countryId,
            count: sql<number>`count(*)::int`,
        })
        .from(circuits)
        .where(eq(circuits.actif, true))
        .groupBy(circuits.countryId)

    // Map counts to countries
    const countriesWithCount = allCountries.map(c => ({
        ...c,
        circuitCount: circuitCounts.find(cc => cc.countryId === c.id)?.count ?? 0,
    }))

    return <DestinationsClient countries={countriesWithCount} />
}
