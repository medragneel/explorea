// components/CircuitCard.tsx
import { useTranslations, useLocale } from 'next-intl'
import { getField, formatPrice } from '@/lib/i18n-field'
import { Clock, MapPin, ArrowRight } from 'lucide-react'
import { Link } from '@/lib/navigation'
import type { Circuit } from '@/db/schema'

// ── Region color mapping ──────────────────────────────────────────────────
function getRegionStyle(region: string) {
    const r = (region ?? '').toLowerCase()
    if (r.includes('tamanrasset') || r.includes('ouargla') || r.includes('djanet') ||
        r.includes('hoggar') || r.includes('adrar') || r.includes('timimoun') || r.includes('sahara'))
        return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-400' }
    if (r.includes('alger') || r.includes('béjaïa') || r.includes('oran') ||
        r.includes('tlemcen') || r.includes('annaba') || r.includes('constantine'))
        return { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200', dot: 'bg-sky-400' }
    if (r.includes('maroc') || r.includes('morocco') || r.includes('marrakech'))
        return { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', dot: 'bg-rose-400' }
    if (r.includes('egypt') || r.includes('égypte') || r.includes('cairo'))
        return { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-400' }
    if (r.includes('kenya') || r.includes('ethiopia') || r.includes('africa'))
        return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-400' }
    if (r.includes('nepal') || r.includes('jordan') || r.includes('asia'))
        return { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', dot: 'bg-violet-400' }
    return { bg: 'bg-[#1B2D5B]/5', text: 'text-[#1B2D5B]', border: 'border-[#1B2D5B]/15', dot: 'bg-[#1B2D5B]' }
}

function getDurationBadge(duree: number) {
    if (duree <= 5) return { label: 'Court séjour', color: 'text-violet-600 bg-violet-50 border-violet-200' }
    if (duree <= 9) return { label: 'Séjour', color: 'text-blue-600 bg-blue-50 border-blue-200' }
    return { label: 'Grand circuit', color: 'text-orange-600 bg-orange-50 border-orange-200' }
}

// ─────────────────────────────────────────────────────────────────────────

export default function CircuitCard({ circuit }: { circuit: Circuit }) {
    const t = useTranslations('circuits')
    const locale = useLocale()

    // ✅ Use i18n fields with fallback to plain text columns
    const name = getField((circuit as any).nomI18n ?? circuit.nom, locale)
    const description = getField((circuit as any).descriptionI18n ?? circuit.description, locale)
    const price = formatPrice(circuit.prix, (circuit as any).currency ?? 'DZD', locale)

    const regionStyle = getRegionStyle(circuit.region ?? '')
    const durationBadge = getDurationBadge(circuit.duree)

    return (
        <Link
            href={`/circuits/${circuit.id}`}
            className="group block bg-white border border-[#1B2D5B]/08 hover:border-[#B8962E]/30 hover:shadow-[0_8px_30px_rgba(27,45,91,0.08)] transition-all duration-400 overflow-hidden"
        >
            {/* Image */}
            <div className="relative h-52 overflow-hidden bg-[#1B2D5B]/5">
                {circuit.image ? (
                    <img
                        src={circuit.image}
                        alt={name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#1B2D5B]/10 to-[#B8962E]/10 flex items-center justify-center">
                        <MapPin className="h-8 w-8 text-[#1B2D5B]/20" />
                    </div>
                )}

                {/* Dark overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1B2D5B]/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />

                {/* Duration badge — top left */}
                <div className="absolute top-3 left-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono tracking-wider uppercase border rounded-sm ${durationBadge.color}`}>
                        <Clock className="h-2.5 w-2.5" />
                        {circuit.duree} {t('days')}
                    </span>
                </div>

                {/* Arrow on hover — top right */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                    <div className="w-8 h-8 bg-[#B8962E] flex items-center justify-center">
                        <ArrowRight className="h-4 w-4 text-white" />
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-5">

                {/* Region tag */}
                <div className="flex items-center justify-between mb-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono tracking-wide border rounded-sm ${regionStyle.bg} ${regionStyle.text} ${regionStyle.border}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${regionStyle.dot}`} />
                        {circuit.region}
                    </span>

                    {/* Category badge if available */}
                    {(circuit as any).category && (
                        <span className="text-[9px] font-mono tracking-widest text-[#1B2D5B]/30 uppercase">
                            {(circuit as any).category}
                        </span>
                    )}
                </div>

                {/* Name — uses i18n */}
                <h2
                    className="text-lg font-light text-[#1B2D5B] mb-2 leading-snug group-hover:text-[#B8962E] transition-colors duration-300"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                    {name}
                </h2>

                {/* Description — uses i18n */}
                <p className="text-[#1B2D5B]/50 text-xs leading-relaxed line-clamp-2 mb-4 font-light">
                    {description}
                </p>

                {/* Divider */}
                <div className="h-px bg-[#1B2D5B]/06 mb-4" />

                {/* Footer */}
                <div className="flex items-end justify-between">
                    <div>
                        <p className="text-[9px] font-mono tracking-widest text-[#1B2D5B]/30 uppercase mb-0.5">
                            {t('from')}
                        </p>
                        {/* ✅ Uses formatPrice with correct currency */}
                        <p
                            className="text-xl font-light text-[#B8962E]"
                            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                        >
                            {price}
                        </p>
                    </div>

                    <div className="w-8 h-8 bg-[#1B2D5B] group-hover:bg-[#B8962E] flex items-center justify-center transition-all duration-300">
                        <ArrowRight className="h-4 w-4 text-white" />
                    </div>
                </div>
            </div>
        </Link>
    )
}
