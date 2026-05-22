// components/home/FeaturedCircuitsClient.tsx
'use client'

import { useRef } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { motion, useInView } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { MapPin, ArrowRight, Clock } from 'lucide-react'
import { Link } from '@/lib/navigation'
import { getField, formatPrice } from '@/lib/i18n-field'
import type { Circuit } from '@/db/schema'

const EASE = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number]
const fadeUp = {
    hidden: { opacity: 0, y: 60 },
    visible: (i = 0) => ({
        opacity: 1, y: 0,
        transition: { duration: 0.8, delay: i * 0.12, ease: EASE },
    }),
}
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }

// ── Accent color per index ─────────────────────────────────────────────────
const CARD_STYLES = [
    { color: 'from-amber-900/80 to-orange-950/90', accent: '#D97706', tag: 'Bestseller' },
    { color: 'from-red-900/80 to-stone-950/90', accent: '#DC2626', tag: 'Exclusif' },
    { color: 'from-sky-900/80 to-blue-950/90', accent: '#0284C7', tag: 'Nouveau' },
    { color: 'from-yellow-900/80 to-amber-950/90', accent: '#CA8A04', tag: 'Culturel' },
]

export default function FeaturedCircuitsClient({ circuits }: { circuits: Circuit[] }) {
    const ref = useRef(null)
    const inView = useInView(ref, { once: true, margin: '-80px' })
    const t = useTranslations('circuits')

    const locale = useLocale()

    if (!circuits.length) return null

    return (
        <section className="py-28 px-6 md:px-12 lg:px-20 max-w-7xl mx-auto">
            <motion.div ref={ref} variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'}>

                {/* Section header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                    <div>
                        <motion.div variants={fadeUp} className="flex items-center gap-3 mb-4">
                            <div className="h-px w-10 bg-amber-500" />
                            <span className="text-amber-500 text-xs tracking-[0.3em] uppercase font-light font-mono">
                                {t('title')}
                            </span>
                        </motion.div>
                        <motion.h2
                            variants={fadeUp}
                            custom={1}
                            className="text-4xl md:text-5xl font-light leading-tight"
                            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                        >
                            Les trésors<br />
                            <em className="text-amber-300">du monde</em>
                        </motion.h2>
                    </div>
                    <motion.div variants={fadeUp} custom={2}>
                        <Link
                            href="/circuits"
                            className="inline-flex items-center gap-2 text-white/50 hover:text-white border border-white/10 hover:border-white/30 rounded-none tracking-widest text-xs h-10 px-6 transition-all duration-300"
                        >
                            Voir tout <ArrowRight className="h-3 w-3" />
                        </Link>
                    </motion.div>
                </div>

                {/* Cards grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {circuits.map((circuit, i) => {
                        const style = CARD_STYLES[i % CARD_STYLES.length]
                        const name = getField((circuit as any).nomI18n ?? circuit.nom, locale)
                        const description = getField((circuit as any).descriptionI18n ?? circuit.description, locale)
                        const price = formatPrice(circuit.prix, (circuit as any).currency ?? 'DZD', locale)
                        const isFirst = i === 0

                        return (
                            <motion.div
                                key={circuit.id}
                                variants={fadeUp}
                                custom={i}
                                whileHover={{ y: -6 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                className="group relative overflow-hidden cursor-pointer"
                                style={{ minHeight: isFirst ? '420px' : '280px' }}
                            >
                                {/* Background image or gradient */}
                                {circuit.image ? (
                                    <>
                                        <div className="absolute inset-0">
                                            <img
                                                src={circuit.image}
                                                alt={name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                            />
                                        </div>
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#080604]/90 via-[#080604]/30 to-transparent" />
                                    </>
                                ) : (
                                    <div className={`absolute inset-0 bg-gradient-to-br ${style.color}`} />
                                )}

                                {/* Glow */}
                                <div
                                    className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10 blur-3xl group-hover:opacity-20 transition-opacity duration-500"
                                    style={{ background: style.accent }}
                                />

                                {/* Content */}
                                <div className="relative z-10 h-full p-8 flex flex-col justify-between" style={{ minHeight: isFirst ? '420px' : '280px' }}>
                                    {/* Top row */}
                                    <div className="flex items-start justify-between">
                                        <Badge
                                            className="text-[10px] tracking-[0.2em] uppercase font-mono rounded-none px-3 py-1"
                                            style={{
                                                background: `${style.accent}30`,
                                                color: style.accent,
                                                border: `1px solid ${style.accent}40`,
                                            }}
                                        >
                                            {style.tag}
                                        </Badge>
                                        <div className="flex items-center gap-1.5 text-white/40 text-xs font-mono">
                                            <Clock className="h-3 w-3" />
                                            {circuit.duree} jours
                                        </div>
                                    </div>

                                    {/* Bottom content */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <MapPin className="h-3 w-3 text-white/40" />
                                            <span className="text-white/50 text-xs tracking-wide font-mono">
                                                {circuit.region ?? ''}
                                            </span>
                                        </div>

                                        {/* ✅ i18n name */}
                                        <h3
                                            className="text-2xl md:text-3xl font-light text-white mb-3 leading-tight"
                                            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                                        >
                                            {name}
                                        </h3>

                                        {/* ✅ i18n description */}
                                        <p className="text-white/50 text-sm leading-relaxed mb-6 max-w-sm line-clamp-2">
                                            {description}
                                        </p>

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="text-white/30 text-[10px] font-mono tracking-widest uppercase mb-1">
                                                    {t('from')}
                                                </div>
                                                {/* ✅ formatPrice with currency */}
                                                <div
                                                    className="text-xl font-light"
                                                    style={{ color: style.accent }}
                                                >
                                                    {price}
                                                </div>
                                            </div>
                                            <Link
                                                href={`/circuits/${circuit.id}`}
                                                className="inline-flex items-center h-9 px-5 rounded-none text-[10px] tracking-widest transition-all duration-300 text-black gap-1.5 hover:opacity-90"
                                                style={{ background: style.accent }}
                                            >
                                                {t('book')}
                                                <ArrowRight className="h-3 w-3" />
                                            </Link>
                                        </div>
                                    </div>
                                </div>

                                {/* Hover shimmer */}
                                <div
                                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                                    style={{ background: `linear-gradient(135deg, ${style.accent}08, transparent 50%)` }}
                                />
                            </motion.div>
                        )
                    })}
                </div>
            </motion.div>
        </section>
    )
}
