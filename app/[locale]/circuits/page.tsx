// app/[locale]/circuits/page.tsx
import { getTranslations } from 'next-intl/server'
import { db } from '@/db'
import { circuits, countries } from '@/db/schema'
import { eq } from 'drizzle-orm'
import CircuitsClient from '@/components/CircuitsClient'
import type { Metadata } from 'next'

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

// ── Circuits list ─────────────────────────────────────────────────────────
export async function generateMetadata_CircuitsPage({
    params,
}: {
    params: Promise<{ locale: string }>
}): Promise<Metadata> {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: 'circuits' })

    const titles: Record<string, string> = {
        fr: 'Nos Circuits — Voyages en Algérie et dans le Monde',
        en: 'Our Circuits — Algeria & World Tours',
        ar: 'جولاتنا — رحلات الجزائر والعالم',
    }
    const descs: Record<string, string> = {
        fr: 'Découvrez nos circuits de voyages exceptionnels en Algérie : désert du Sahara, Tassili, sites romains, côte méditerranéenne et bien plus.',
        en: 'Discover our exceptional travel circuits in Algeria: Sahara desert, Tassili, Roman sites, Mediterranean coast and more.',
        ar: 'اكتشف جولاتنا الاستثنائية في الجزائر: صحراء الساحل، تاسيلي، المواقع الرومانية، الساحل المتوسط والمزيد.',
    }

    return {
        title: titles[locale] ?? titles.fr,
        description: descs[locale] ?? descs.fr,
        alternates: {
            canonical: `${BASE}/${locale}/circuits`,
            languages: { fr: `${BASE}/fr/circuits`, ar: `${BASE}/ar/circuits`, en: `${BASE}/en/circuits` },
        },
        openGraph: {
            title: titles[locale] ?? titles.fr,
            description: descs[locale] ?? descs.fr,
            url: `${BASE}/${locale}/circuits`,
            images: [{ url: `${BASE}/og-circuits.jpg`, width: 1200, height: 630 }],
        },
    }
}



export default async function CircuitsPage() {
    const t = await getTranslations('circuits')

    const [allCircuits, allCountries] = await Promise.all([
        db.select().from(circuits).where(eq(circuits.actif, true)),
        db.select().from(countries).where(eq(countries.actif, true)),
    ])

    return (
        <CircuitsClient
            circuits={allCircuits}
            countries={allCountries}
            translations={{
                title: t('title'),
                subtitle: t('subtitle'),
                days: t('days'),
                from: t('from'),
                book: t('book'),
                no_results: t('no_results'),
                search_placeholder: t('search_placeholder'),
                sort_price_asc: t('sort_price_asc'),
                sort_price_desc: t('sort_price_desc'),
                sort_duration: t('sort_duration'),
                filter_all: t('filter_all'),
            }}
        />
    )
}
