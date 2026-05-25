// app/[locale]/destinations/[code]/page.tsx
import { notFound } from 'next/navigation'
import { db } from '@/db'
import { countries, circuits, departs } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import CountryClient from '@/components/CountryClient'

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
