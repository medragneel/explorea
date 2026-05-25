// app/[locale]/destinations/page.tsx
import { db } from '@/db'
import { countries, circuits } from '@/db/schema'
import { eq, sql } from 'drizzle-orm'
import DestinationsClient from '@/components/DestinationsClient'

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
