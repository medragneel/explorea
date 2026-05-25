// components/CountryClient.tsx
'use client'

import { useRef, useState } from 'react'
import { useLocale } from 'next-intl'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Link } from '@/lib/navigation'
import { getField, formatPrice } from '@/lib/i18n-field'
import { ArrowLeft, MapPin, Clock, ArrowRight, Globe } from 'lucide-react'
import type { Circuit, Country } from '@/db/schema'

const EASE = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number]

const DEFAULT_IMAGES: Record<string, string> = {
    DZ: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1600',
    MA: 'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=1600',
    TN: 'https://images.unsplash.com/photo-1539635278303-d4002c07eae3?w=1600',
    EG: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=1600',
    JO: 'https://images.unsplash.com/photo-1579033461380-adb47c3eb938?w=1600',
    KE: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1600',
    ZA: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=1600',
    IS: 'https://images.unsplash.com/photo-1520769945061-0a448c463865?w=1600',
    NP: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1600',
    PE: 'https://images.unsplash.com/photo-1580502304784-8985b7eb7260?w=1600',
    ET: 'https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=1600',
}

function getDurationBadge(duree: number) {
    if (duree <= 5) return { label: 'Court séjour', color: 'text-violet-600 bg-violet-50 border-violet-200' }
    if (duree <= 8) return { label: 'Séjour', color: 'text-blue-600 bg-blue-50 border-blue-200' }
    return { label: 'Grand circuit', color: 'text-orange-600 bg-orange-50 border-orange-200' }
}

export default function CountryClient({
    country,
    circuits,
    locale,
}: {
    country: Country
    circuits: Circuit[]
    locale: string
}) {
    const heroRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
    const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '35%'])
    const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

    const countryName = getField(country.name, locale)
    const heroImage = (country.image as string) || DEFAULT_IMAGES[country.code] || null

    const [activeCategory, setActiveCategory] = useState('all')

    // Get unique categories from circuits
    const categories = ['all', ...Array.from(new Set(
        circuits.map(c => (c as any).category).filter(Boolean)
    ))]

    const filtered = activeCategory === 'all'
        ? circuits
        : circuits.filter(c => (c as any).category === activeCategory)

    return (
        <div className="min-h-screen bg-[#F9F7F4]">

            {/* ── HERO ──────────────────────────────────────────────── */}
            <section ref={heroRef} className="relative h-[65vh] overflow-hidden">
                <motion.div className="absolute inset-0" style={{ y: heroY }}>
                    {heroImage ? (
                        <img
                            src={heroImage}
                            alt={countryName}
                            className="w-full h-full object-cover scale-110"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#1B2D5B] to-[#B8962E]/40 flex items-center justify-center">
                            <span className="text-8xl">{(country.flag as string) ?? '🌍'}</span>
                        </div>
                    )}
                </motion.div>

                {/* Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#080604]/90 via-[#080604]/30 to-[#080604]/10" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#080604]/30 to-transparent" />

                {/* Back */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="absolute top-8 left-6 md:left-10 z-10"
                >
                    <Link
                        href="/destinations"
                        className="inline-flex items-center gap-2 text-white/70 hover:text-white text-xs font-mono tracking-widest uppercase transition-colors bg-black/20 backdrop-blur-sm px-4 py-2 border border-white/10"
                    >
                        <ArrowLeft className="h-3 w-3" />
                        Destinations
                    </Link>
                </motion.div>

                {/* Content */}
                <motion.div
                    className="absolute bottom-0 left-0 right-0 p-6 md:p-12"
                    style={{ opacity: heroOpacity }}
                >
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: EASE }}
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-px w-8 bg-[#B8962E]" />
                            <span className="text-[#B8962E] text-[10px] font-mono tracking-[0.4em] uppercase">
                                {country.continent}
                            </span>
                        </div>

                        <div className="flex items-end gap-5 mb-4">
                            <span className="text-5xl">{(country.flag as string) ?? '🌍'}</span>
                            <h1
                                className="text-4xl md:text-6xl font-light text-white leading-tight"
                                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                            >
                                {countryName}
                            </h1>
                        </div>

                        {/* Quick stats */}
                        <div className="flex items-center gap-4 flex-wrap">
                            <div className="flex items-center gap-2 bg-black/25 backdrop-blur-sm border border-white/10 px-3 py-2">
                                <Globe className="h-3.5 w-3.5 text-[#B8962E]" />
                                <div>
                                    <div className="text-white text-xs font-light">{circuits.length} circuits</div>
                                    <div className="text-white/40 text-[9px] font-mono">Disponibles</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 bg-black/25 backdrop-blur-sm border border-white/10 px-3 py-2">
                                <MapPin className="h-3.5 w-3.5 text-[#B8962E]" />
                                <div>
                                    <div className="text-white text-xs font-light">{country.currency}</div>
                                    <div className="text-white/40 text-[9px] font-mono">Devise locale</div>
                                </div>
                            </div>
                            {circuits.length > 0 && (
                                <div className="flex items-center gap-2 bg-black/25 backdrop-blur-sm border border-white/10 px-3 py-2">
                                    <Clock className="h-3.5 w-3.5 text-[#B8962E]" />
                                    <div>
                                        <div className="text-white text-xs font-light">
                                            {Math.min(...circuits.map(c => c.duree))}–{Math.max(...circuits.map(c => c.duree))} jours
                                        </div>
                                        <div className="text-white/40 text-[9px] font-mono">Durée des circuits</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            </section>

            {/* ── CATEGORY FILTER ───────────────────────────────────── */}
            {categories.length > 2 && (
                <div className="sticky top-[64px] md:top-[80px] z-30 bg-white border-b border-[#1B2D5B]/08 shadow-sm">
                    <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-2 overflow-x-auto">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`flex-shrink-0 px-3.5 py-1.5 text-[11px] font-mono tracking-wide uppercase rounded-sm transition-all duration-200 ${activeCategory === cat
                                        ? 'bg-[#1B2D5B] text-white'
                                        : 'text-[#1B2D5B]/50 hover:text-[#1B2D5B] hover:bg-[#1B2D5B]/5'
                                    }`}
                            >
                                {cat === 'all' ? 'Tous' : cat}
                            </button>
                        ))}
                        <span className="ml-auto text-[10px] font-mono text-[#1B2D5B]/30 flex-shrink-0">
                            {filtered.length} circuit{filtered.length !== 1 ? 's' : ''}
                        </span>
                    </div>
                </div>
            )}

            {/* ── CIRCUITS ──────────────────────────────────────────── */}
            <div className="max-w-7xl mx-auto px-6 py-12">

                {/* Section header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="h-px w-8 bg-[#B8962E]" />
                            <span className="text-[#B8962E] text-[10px] font-mono tracking-[0.4em] uppercase">
                                Circuits disponibles
                            </span>
                        </div>
                        <h2
                            className="text-2xl font-light text-[#1B2D5B]"
                            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                        >
                            Explorez {countryName}
                        </h2>
                    </div>
                </div>

                {filtered.length === 0 ? (
                    <div className="text-center py-20 bg-white border border-[#1B2D5B]/08">
                        <Globe className="h-10 w-10 text-[#1B2D5B]/10 mx-auto mb-4" />
                        <p className="text-[#1B2D5B]/40 font-light text-sm">
                            Aucun circuit disponible pour cette destination
                        </p>
                        <Link
                            href="/contact"
                            className="inline-flex items-center gap-2 mt-4 text-xs font-mono tracking-widest text-[#B8962E] uppercase border border-[#B8962E]/30 px-4 py-2 hover:bg-[#B8962E]/5 transition-colors"
                        >
                            Circuit sur mesure <ArrowRight className="h-3 w-3" />
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filtered.map((circuit, i) => {
                            const name = getField((circuit as any).nomI18n ?? circuit.nom, locale)
                            const description = getField((circuit as any).descriptionI18n ?? circuit.description, locale)
                            const price = formatPrice(circuit.prix, (circuit as any).currency ?? country.currency, locale)
                            const badge = getDurationBadge(circuit.duree)

                            return (
                                <motion.div
                                    key={circuit.id}
                                    initial={{ opacity: 0, y: 24 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: i * 0.07, ease: EASE }}
                                >
                                    <Link
                                        href={`/circuits/${circuit.id}`}
                                        className="group block bg-white border border-[#1B2D5B]/08 hover:border-[#B8962E]/30 hover:shadow-[0_8px_30px_rgba(27,45,91,0.08)] transition-all duration-400 overflow-hidden"
                                    >
                                        {/* Image */}
                                        <div className="relative h-48 overflow-hidden bg-[#1B2D5B]/5">
                                            {circuit.image ? (
                                                <img
                                                    src={circuit.image}
                                                    alt={name}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-[#1B2D5B]/10 to-[#B8962E]/10 flex items-center justify-center">
                                                    <span className="text-4xl">{(country.flag as string) ?? '🌍'}</span>
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-[#1B2D5B]/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />

                                            {/* Duration */}
                                            <div className="absolute top-3 left-3">
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono border rounded-sm ${badge.color}`}>
                                                    <Clock className="h-2.5 w-2.5" />
                                                    {circuit.duree}j
                                                </span>
                                            </div>

                                            {/* Arrow */}
                                            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                                                <div className="w-7 h-7 bg-[#B8962E] flex items-center justify-center">
                                                    <ArrowRight className="h-3.5 w-3.5 text-white" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="p-4">
                                            {circuit.region && (
                                                <div className="flex items-center gap-1 text-[9px] font-mono text-[#B8962E]/70 uppercase tracking-widest mb-2">
                                                    <MapPin className="h-2.5 w-2.5" />
                                                    {circuit.region}
                                                </div>
                                            )}
                                            <h3
                                                className="text-base font-light text-[#1B2D5B] mb-1.5 group-hover:text-[#B8962E] transition-colors"
                                                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                                            >
                                                {name}
                                            </h3>
                                            <p className="text-xs text-[#1B2D5B]/40 line-clamp-2 mb-4 font-light leading-relaxed">
                                                {description}
                                            </p>
                                            <div className="flex items-center justify-between pt-3 border-t border-[#1B2D5B]/06">
                                                <div>
                                                    <p className="text-[9px] font-mono text-[#1B2D5B]/25 uppercase tracking-widest mb-0.5">
                                                        À partir de
                                                    </p>
                                                    <p
                                                        className="text-lg font-light text-[#B8962E]"
                                                        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                                                    >
                                                        {price}
                                                    </p>
                                                </div>
                                                <div className="w-7 h-7 bg-[#1B2D5B] group-hover:bg-[#B8962E] flex items-center justify-center transition-all duration-300">
                                                    <ArrowRight className="h-3.5 w-3.5 text-white" />
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            )
                        })}
                    </div>
                )}

                {/* CTA — custom circuit */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="mt-12 bg-[#1B2D5B] p-8 flex flex-col md:flex-row items-center justify-between gap-6"
                >
                    <div>
                        <p className="text-[#B8962E] text-[10px] font-mono tracking-[0.3em] uppercase mb-2">
                            Voyage sur mesure
                        </p>
                        <h3
                            className="text-xl font-light text-white"
                            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                        >
                            Vous ne trouvez pas ce que vous cherchez en {countryName} ?
                        </h3>
                        <p className="text-white/40 text-sm mt-1 font-light">
                            Notre équipe crée votre itinéraire sur mesure.
                        </p>
                    </div>
                    <Link
                        href="/contact"
                        className="flex-shrink-0 inline-flex items-center gap-2 bg-[#B8962E] hover:bg-[#D4AF5A] text-white text-xs tracking-widest font-mono uppercase px-6 py-3 transition-all duration-300"
                    >
                        Contactez-nous <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                </motion.div>
            </div>
        </div>
    )
}
