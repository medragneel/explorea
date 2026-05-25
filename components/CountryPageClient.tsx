// components/CountryPageClient.tsx
'use client'

import { useRef } from 'react'
import { useLocale } from 'next-intl'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Link } from '@/lib/navigation'
import { getField, formatPrice } from '@/lib/i18n-field'
import { Badge } from '@/components/ui/badge'
import {
    ArrowLeft, MapPin, Clock, ArrowRight,
    Banknote, Globe, Users,
} from 'lucide-react'
import type { Circuit, Country } from '@/db/schema'

const EASE = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number]

export default function CountryPageClient({
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
    const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '40%'])
    const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0])

    const countryName = getField(country.name, locale)
    const flag = country.flag as string ?? ''

    const durations = circuits.map(c => c.duree)
    const minDur = durations.length ? Math.min(...durations) : 0
    const maxDur = durations.length ? Math.max(...durations) : 0

    return (
        <div className="min-h-screen bg-[#F9F7F4]">

            {/* ── HERO ──────────────────────────────────────────────── */}
            <section ref={heroRef} className="relative h-[65vh] overflow-hidden">
                <motion.div className="absolute inset-0" style={{ y: heroY }}>
                    {country.image ? (
                        <img
                            src={country.image}
                            alt={countryName}
                            className="w-full h-full object-cover scale-110"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#1B2D5B] via-[#2d4a7a] to-[#B8962E]" />
                    )}
                </motion.div>

                {/* Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#080604]/95 via-[#080604]/40 to-[#080604]/20" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#080604]/50 to-transparent" />

                {/* Back button */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="absolute top-8 left-6 md:left-10 z-10"
                >
                    <Link
                        href="/destinations"
                        className="inline-flex items-center gap-2 text-white/60 hover:text-white text-xs font-mono tracking-widest uppercase transition-colors bg-black/20 backdrop-blur-sm px-4 py-2 border border-white/10"
                    >
                        <ArrowLeft className="h-3 w-3" />
                        Destinations
                    </Link>
                </motion.div>

                {/* Hero content */}
                <motion.div
                    className="absolute bottom-0 left-0 right-0 p-8 md:p-12"
                    style={{ opacity: heroOpacity }}
                >
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: EASE }}
                    >
                        {/* Eyebrow */}
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-px w-8 bg-[#B8962E]" />
                            <span className="text-[#B8962E] text-[10px] font-mono tracking-[0.4em] uppercase">
                                {country.continent}
                            </span>
                        </div>

                        {/* Country name + flag */}
                        <div className="flex items-center gap-4 mb-4">
                            <span className="text-5xl">{flag}</span>
                            <h1
                                className="text-5xl md:text-7xl font-light text-white leading-tight"
                                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                            >
                                {countryName}
                            </h1>
                        </div>

                        {/* Stats strip */}
                        <div className="flex flex-wrap items-center gap-4 mt-6">
                            {[
                                { icon: Globe, value: `${circuits.length} circuits` },
                                { icon: Clock, value: durations.length ? `${minDur}–${maxDur} jours` : '—' },
                                { icon: Banknote, value: country.currency },
                                { icon: Users, value: 'Groupes & privé' },
                            ].map(s => (
                                <div key={s.value} className="flex items-center gap-2 bg-black/25 backdrop-blur-sm border border-white/10 px-3 py-2">
                                    <s.icon className="h-3.5 w-3.5 text-[#B8962E]" />
                                    <span className="text-white/70 text-xs font-light">{s.value}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </motion.div>
            </section>

            {/* ── CIRCUITS ──────────────────────────────────────────── */}
            <div className="max-w-7xl mx-auto px-6 py-16">

                {/* Section header */}
                <div className="flex items-end justify-between mb-10">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="h-px w-8 bg-[#B8962E]" />
                            <span className="text-[#B8962E] text-[10px] font-mono tracking-[0.4em] uppercase">
                                {flag} {countryName}
                            </span>
                        </div>
                        <h2
                            className="text-3xl md:text-4xl font-light text-[#1B2D5B]"
                            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                        >
                            {circuits.length} circuit{circuits.length !== 1 ? 's' : ''} disponible{circuits.length !== 1 ? 's' : ''}
                        </h2>
                    </div>
                    <Link
                        href="/circuits"
                        className="hidden md:flex items-center gap-2 text-[10px] font-mono tracking-widests text-[#1B2D5B]/40 hover:text-[#B8962E] uppercase transition-colors"
                    >
                        Tous les circuits <ArrowRight className="h-3 w-3" />
                    </Link>
                </div>

                {circuits.length === 0 ? (
                    <div className="text-center py-20 bg-white border border-[#1B2D5B]/08">
                        <Globe className="h-10 w-10 text-[#1B2D5B]/10 mx-auto mb-4" />
                        <p className="text-[#1B2D5B]/30 font-light mb-4">
                            Aucun circuit disponible pour cette destination
                        </p>
                        <p className="text-xs text-[#1B2D5B]/20 font-mono">
                            Revenez bientôt ou contactez-nous pour un circuit sur mesure
                        </p>
                        <Link
                            href="/contact"
                            className="inline-flex items-center gap-2 mt-6 text-[10px] font-mono tracking-widest text-[#B8962E] uppercase border border-[#B8962E]/30 px-5 py-2.5 hover:bg-[#B8962E]/5 transition-colors"
                        >
                            Circuit sur mesure <ArrowRight className="h-3 w-3" />
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {circuits.map((circuit, i) => (
                            <CountryCircuitCard
                                key={circuit.id}
                                circuit={circuit}
                                index={i}
                                locale={locale}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

// ─── Circuit card for country page ────────────────────────────────────────

function CountryCircuitCard({
    circuit,
    index,
    locale,
}: {
    circuit: Circuit
    index: number
    locale: string
}) {
    const name = getField((circuit as any).nomI18n ?? circuit.nom, locale)
    const description = getField((circuit as any).descriptionI18n ?? circuit.description, locale)
    const price = formatPrice(circuit.prix, (circuit as any).currency ?? 'DZD', locale)

    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.07, ease: EASE }}
        >
            <Link
                href={`/circuits/${circuit.id}`}
                className="group block bg-white border border-[#1B2D5B]/08 hover:border-[#B8962E]/30 hover:shadow-[0_8px_30px_rgba(27,45,91,0.08)] transition-all duration-300 overflow-hidden"
            >
                {/* Image */}
                <div className="relative h-48 bg-[#1B2D5B]/05 overflow-hidden">
                    {circuit.image ? (
                        <img
                            src={circuit.image}
                            alt={name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#1B2D5B]/10 to-[#B8962E]/10 flex items-center justify-center">
                            <MapPin className="h-8 w-8 text-[#1B2D5B]/15" />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1B2D5B]/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute top-3 left-3">
                        <span className="bg-black/30 backdrop-blur-sm text-white/70 text-[9px] font-mono tracking-widest px-2.5 py-1 border border-white/10 inline-flex items-center gap-1.5">
                            <Clock className="h-2.5 w-2.5" />
                            {circuit.duree} jours
                        </span>
                    </div>
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                        <div className="w-8 h-8 bg-[#B8962E] flex items-center justify-center">
                            <ArrowRight className="h-4 w-4 text-white" />
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-[9px] font-mono tracking-widest text-[#B8962E]/60 uppercase flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#B8962E]" />
                            {circuit.region ?? ''}
                        </span>
                        {(circuit as any).category && (
                            <span className="text-[9px] font-mono text-[#1B2D5B]/20 uppercase ml-auto">
                                {(circuit as any).category}
                            </span>
                        )}
                    </div>
                    <h3
                        className="text-base font-light text-[#1B2D5B] mb-2 group-hover:text-[#B8962E] transition-colors duration-300 leading-snug"
                        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                    >
                        {name}
                    </h3>
                    <p className="text-xs text-[#1B2D5B]/40 line-clamp-2 leading-relaxed font-light mb-4">
                        {description}
                    </p>
                    <div className="flex items-center justify-between pt-3 border-t border-[#1B2D5B]/06">
                        <p
                            className="text-lg font-light text-[#B8962E]"
                            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                        >
                            {price}
                        </p>
                        <div className="w-7 h-7 bg-[#1B2D5B] group-hover:bg-[#B8962E] flex items-center justify-center transition-all duration-300">
                            <ArrowRight className="h-3.5 w-3.5 text-white" />
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    )
}
