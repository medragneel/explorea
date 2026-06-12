// app/[locale]/circuits/page.tsx
import { getTranslations } from 'next-intl/server'
import { db } from '@/db'
import { circuits, countries } from '@/db/schema'
import { eq } from 'drizzle-orm'
import CircuitsClient from '@/components/CircuitsClient'

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
                title:              t('title'),
                subtitle:           t('subtitle'),
                days:               t('days'),
                from:               t('from'),
                book:               t('book'),
                no_results:         t('no_results'),
                search_placeholder: t('search_placeholder'),
                sort_price_asc:     t('sort_price_asc'),
                sort_price_desc:    t('sort_price_desc'),
                sort_duration:      t('sort_duration'),
                filter_all:         t('filter_all'),
            }}
        />
    )
}
