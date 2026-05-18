// db/queries/countries.ts
import { db } from '@/db'
import { countries, circuits } from '@/db/schema'
import { eq, sql } from 'drizzle-orm'

export async function getCountries() {
    return await db
        .select()
        .from(countries)
        .where(eq(countries.actif, true))
}

export async function getCountryWithCircuits(code: string) {
    const country = await db.query.countries.findFirst({
        where: eq(countries.code, code),
    })
    if (!country) return null

    const circuitList = await db
        .select()
        .from(circuits)
        .where(and(eq(circuits.countryId, country.id), eq(circuits.actif, true)))

    return { country, circuits: circuitList }
}
