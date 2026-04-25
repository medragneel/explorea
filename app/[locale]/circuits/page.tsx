// app/[locale]/circuits/page.tsx
import { getTranslations } from 'next-intl/server'
import { getCircuits } from '@/db/queries/circuits'
import CircuitsClient from '@/components/CircuitsClient'

export default async function CircuitsPage() {
    const t = await getTranslations('circuits')
    const circuits = await getCircuits()

    return (
        <CircuitsClient
            circuits={circuits}
            translations={{
                title: t('title'),
                subtitle: t('subtitle'),
                days: t('days'),
                price: t('price'),
                book: t('book'),
                available_seats: t('available_seats'),
                filter_all: t('filter_all'),
                filter_sahara: t('filter_sahara'),
                filter_nord: t('filter_nord'),
                filter_culturel: t('filter_culturel'),
                sort_price_asc: t('sort_price_asc'),
                sort_price_desc: t('sort_price_desc'),
                sort_duration: t('sort_duration'),
                no_results: t('no_results'),
                from: t('from'),
                search_placeholder: t('search_placeholder'),
            }}
        />
    )
}
