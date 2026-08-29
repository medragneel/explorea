// app/sitemap.ts
import { MetadataRoute } from 'next'
import { db } from '@/db'
import { circuits, countries } from '@/db/schema'
import { eq } from 'drizzle-orm'

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
const LOCALES = ['fr', 'ar', 'en', 'es', 'it'] as const

// Helper — generate one URL entry per locale
function localizedUrls(
    path: string,
    changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'],
    priority: number,
    lastModified = new Date()
): MetadataRoute.Sitemap {
    return LOCALES.map(locale => ({
        url: `${BASE}/${locale}${path}`,
        lastModified,
        changeFrequency,
        priority,
    }))
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // Fetch active circuits + countries in parallel
    const [allCircuits, allCountries] = await Promise.all([
        db
            .select({ id: circuits.id, createdAt: circuits.createdAt })
            .from(circuits)
            .where(eq(circuits.actif, true)),
        db
            .select({ code: countries.code })
            .from(countries)
            .where(eq(countries.actif, true)),
    ])

    // ── Static pages ────────────────────────────────────────────────────
    const staticPages: MetadataRoute.Sitemap = [
        // Homepage — highest priority
        ...localizedUrls('', 'weekly', 1.0),
        // Main section pages
        ...localizedUrls('/circuits', 'daily', 0.9),
        ...localizedUrls('/destinations', 'weekly', 0.9),
        ...localizedUrls('/contact', 'monthly', 0.6),
    ]

    // Also include the root (no locale prefix) pointing to default (fr)
    staticPages.push({
        url: BASE,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 1.0,
    })

    // ── Circuit detail pages ────────────────────────────────────────────
    const circuitPages: MetadataRoute.Sitemap = allCircuits.flatMap(c =>
        localizedUrls(
            `/circuits/${c.id}`,
            'monthly',
            0.8,
            c.createdAt ? new Date(c.createdAt) : new Date()
        )
    )

    // ── Country destination pages ───────────────────────────────────────
    const countryPages: MetadataRoute.Sitemap = allCountries.flatMap(c =>
        localizedUrls(
            `/destinations/${c.code.toLowerCase()}`,
            'weekly',
            0.7
        )
    )

    return [...staticPages, ...circuitPages, ...countryPages]
}
