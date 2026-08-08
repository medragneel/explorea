// app/[locale]/destinations/[code]/page.tsx
import { notFound } from 'next/navigation'
import { db } from '@/db'
import { countries, circuits, departs } from '@/db/schema'
import { getField } from '@/lib/i18n-field'
import { eq, and } from 'drizzle-orm'
import CountryClient from '@/components/CountryClient'

import type { Metadata } from 'next'

const BASE = 'https://explorea-dz.vercel.app'

export async function generateMetadata_CountryPage({
    params,
}: {
    params: Promise<{ code: string; locale: string }>
}): Promise<Metadata> {
    const { code, locale } = await params
    const { countries: countriesTable } = await import('@/db/schema')
    const { eq: eqFn } = await import('drizzle-orm')

    const country = await db.query.countries.findFirst({
        where: eqFn(countriesTable.code, code.toUpperCase()),
    })
    if (!country) return { title: 'Destination introuvable · Explorea' }

    const name = getField(country.name, locale)

    const descs: Record<string, string> = {
        fr: `Découvrez nos circuits de voyage en ${name} avec Explorea. Des expériences uniques guidées par des experts locaux.`,
        en: `Discover our travel circuits in ${name} with Explorea. Unique experiences guided by local experts.`,
        ar: `اكتشف جولاتنا في ${name} مع إكسبلوريا. تجارب فريدة بإرشاد خبراء محليين.`,
    }

    return {
        title: `Circuits en ${name} · Explorea`,
        description: descs[locale] ?? descs.fr,
        alternates: {
            canonical: `${BASE}/${locale}/destinations/${code.toLowerCase()}`,
            languages: {
                fr: `${BASE}/fr/destinations/${code.toLowerCase()}`,
                ar: `${BASE}/ar/destinations/${code.toLowerCase()}`,
                en: `${BASE}/en/destinations/${code.toLowerCase()}`,
            },
        },
        openGraph: {
            title: `Circuits en ${name} · Explorea`,
            description: descs[locale] ?? descs.fr,
            url: `${BASE}/${locale}/destinations/${code.toLowerCase()}`,
            images: country.image
                ? [{ url: country.image as string, width: 1200, height: 630, alt: name }]
                : [{ url: `${BASE}/og-image.jpg`, width: 1200, height: 630 }],
        },
    }
}


export default async function CountryPage({
    params,
}: {
    params: Promise<{ code: string; locale: string }>
}) {
    const { code, locale } = await params

    // Find country by code (case-insensitive)
    const country = await db.query.countries.findFirst({
        where: eq(countries.code, code.toUpperCase()),
    })

    if (!country || !country.actif) notFound()

    // Fetch all active circuits for this country
    const countryCircuits = await db
        .select()
        .from(circuits)
        .where(and(
            eq(circuits.countryId, country.id),
            eq(circuits.actif, true)
        ))

    return (
        <CountryClient
            country={country}
            circuits={countryCircuits}
            locale={locale}
        />
    )
}
