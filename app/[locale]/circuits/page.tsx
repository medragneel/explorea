// app/[locale]/circuits/page.tsx
import { useTranslations } from 'next-intl'
import { getTranslations } from 'next-intl/server'
import { getCircuits } from '@/db/queries/circuits'

export default async function CircuitsPage() {
    const t = await getTranslations('circuits')
    const circuits = await getCircuits()

    return (
        <main>
            <h1>{t('title')}</h1>
            <div>
                {circuits.map(circuit => (
                    <div key={circuit.id}>
                        <h2>{circuit.nom}</h2>
                        <p>{circuit.duree} {t('days')}</p>
                        <p>{t('price')} : {circuit.prix} DZD</p>
                        <button>{t('book')}</button>
                    </div>
                ))}
            </div>
        </main>
    )
}
