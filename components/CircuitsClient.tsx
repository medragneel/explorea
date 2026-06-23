// components/CircuitsClient.tsx
'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocale } from 'next-intl'
import { Link } from '@/lib/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
    MapPin, Clock, ArrowRight,
    Search, SlidersHorizontal, X, Globe,
} from 'lucide-react'
import { getField, formatPrice } from '@/lib/i18n-field'
import type { Circuit, Country } from '@/db/schema'

// ─── Region color mapping ──────────────────────────────────────────────────

function getRegionStyle(region: string | null | undefined) {
    const r = (region ?? '').toLowerCase()
    if (r.includes('tamanrasset') || r.includes('ouargla') || r.includes('djanet') ||
        r.includes('hoggar') || r.includes('tadrart') || r.includes('timimoun') ||
        r.includes('béchar') || r.includes('adrar') || r.includes('sahara') ||
        r.includes('sud'))
        return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-400' }
    if (r.includes('alger') || r.includes('béjaïa') || r.includes('oran') ||
        r.includes('tlemcen') || r.includes('constantine') || r.includes('annaba') ||
        r.includes('tipaza') || r.includes('nord') || r.includes('côte'))
        return { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200', dot: 'bg-sky-400' }
    if (r.includes('ghardaïa') || r.includes("m'zab") || r.includes('batna') ||
        r.includes('sétif') || r.includes('timgad') || r.includes('djemila') ||
        r.includes('tiddis') || r.includes('roman'))
        return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-400' }
    if (r.includes('maroc') || r.includes('morocco') || r.includes('marrakech'))
        return { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', dot: 'bg-rose-400' }
    if (r.includes('egypt') || r.includes('égypte'))
        return { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-400' }
    return { bg: 'bg-[#1B2D5B]/5', text: 'text-[#1B2D5B]', border: 'border-[#1B2D5B]/15', dot: 'bg-[#1B2D5B]' }
}

function getDurationBadge(duree: number) {
    if (duree <= 1) return { label: 'Journée', color: 'text-slate-600 bg-slate-50 border-slate-200' }
    if (duree <= 5) return { label: 'Court séjour', color: 'text-violet-600 bg-violet-50 border-violet-200' }
    if (duree <= 10) return { label: 'Séjour', color: 'text-blue-600 bg-blue-50 border-blue-200' }
    return { label: 'Grand circuit', color: 'text-orange-600 bg-orange-50 border-orange-200' }
}

// ─── Category config ───────────────────────────────────────────────────────

const CATEGORIES = [
    { key: 'all', label: 'Tous', emoji: '🌍' },
    { key: 'adventure', label: 'Aventure', emoji: '🏔' },
    { key: 'cultural', label: 'Culturel', emoji: '🏛' },
    { key: 'wildlife', label: 'Faune', emoji: '🦁' },
    { key: 'luxury', label: 'Luxe', emoji: '✨' },
    { key: 'family', label: 'Famille', emoji: '👨‍👩‍👧' },
    { key: 'honeymoon', label: 'Lune de miel', emoji: '💍' },
    { key: 'photography', label: 'Photographie', emoji: '📷' },
    { key: 'trekking', label: 'Trekking', emoji: '🥾' },
]

// ─── Types ─────────────────────────────────────────────────────────────────

type Translations = {
    title: string
    subtitle: string
    days: string
    from: string
    book: string
    no_results: string
    search_placeholder: string
    sort_price_asc: string
    sort_price_desc: string
    sort_duration: string
    filter_all: string
}

// ─── Main component ────────────────────────────────────────────────────────

export default function CircuitsClient({
    circuits,
    countries = [],
    translations: t,
}: {
    circuits: Circuit[]
    countries?: Country[]
    translations: Translations
}) {
    const locale = useLocale()
    const [search, setSearch] = useState('')
    const [filterCategory, setFilterCategory] = useState('all')
    const [filterCountry, setFilterCountry] = useState('all')
    const [filterDuration, setFilterDuration] = useState('all')
    const [sort, setSort] = useState('default')

    // ── Derive available categories from actual data ───────────────────
    const availableCategories = useMemo(() => {
        const cats = new Set(circuits.map(c => (c as any).category).filter(Boolean))
        return CATEGORIES.filter(c => c.key === 'all' || cats.has(c.key))
    }, [circuits])

    // ── Stats ─────────────────────────────────────────────────────────
    const durations = circuits.map(c => c.duree)
    const minDur = durations.length ? Math.min(...durations) : 1
    const maxDur = durations.length ? Math.max(...durations) : 15

    // ── Filtered & sorted circuits ────────────────────────────────────
    const filtered = useMemo(() => {
        let result = [...circuits]

        // Search — i18n aware
        if (search.trim()) {
            const q = search.toLowerCase()
            result = result.filter(c => {
                const name = getField((c as any).nomI18n ?? c.nom, locale)
                const desc = getField((c as any).descriptionI18n ?? c.description, locale)
                return (
                    name.toLowerCase().includes(q) ||
                    (c.region ?? '').toLowerCase().includes(q) ||
                    desc.toLowerCase().includes(q)
                )
            })
        }

        // Category filter
        if (filterCategory !== 'all') {
            result = result.filter(c => (c as any).category === filterCategory)
        }

        // Country filter
        if (filterCountry !== 'all') {
            result = result.filter(c => (c as any).countryId === filterCountry)
        }

        // Duration filter
        if (filterDuration === 'day') result = result.filter(c => c.duree === 1)
        if (filterDuration === 'short') result = result.filter(c => c.duree > 1 && c.duree <= 5)
        if (filterDuration === 'medium') result = result.filter(c => c.duree > 5 && c.duree <= 10)
        if (filterDuration === 'long') result = result.filter(c => c.duree > 10)

        // Sort
        if (sort === 'price_asc') result.sort((a, b) => a.prix - b.prix)
        if (sort === 'price_desc') result.sort((a, b) => b.prix - a.prix)
        if (sort === 'duration') result.sort((a, b) => a.duree - b.duree)

        return result
    }, [circuits, search, filterCategory, filterCountry, filterDuration, sort, locale])

    const hasFilters = search || filterCategory !== 'all' || filterCountry !== 'all' || filterDuration !== 'all' || sort !== 'default'

    function clearAll() {
        setSearch('')
        setFilterCategory('all')
        setFilterCountry('all')
        setFilterDuration('all')
        setSort('default')
    }

    return (
        <div className="min-h-screen bg-[#F9F7F4]">

            {/* ── PAGE HEADER ─────────────────────────────────────────── */}
            <div className="bg-[#1B2D5B] relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.04]" style={{
                    backgroundImage: 'repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%)',
                    backgroundSize: '24px 24px',
                }} />
                <div className="absolute right-0 top-0 w-96 h-96 rounded-full bg-[#B8962E]/10 blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="relative max-w-7xl mx-auto px-6 py-20 md:py-28">
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}>
                        <div className="flex items-center gap-3 mb-5">
                            <div className="h-px w-10 bg-[#B8962E]" />
                            <span className="text-[#B8962E] text-xs font-mono tracking-[0.4em] uppercase">
                                Explorea · Monde
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-light text-white mb-4 leading-tight"
                            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                            {t.title}
                        </h1>
                        <p className="text-white/50 text-base max-w-xl leading-relaxed font-light">
                            {t.subtitle}
                        </p>
                    </motion.div>

                    {/* Stats */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="flex items-center gap-8 mt-10 pt-8 border-t border-white/10">
                        {[
                            { value: circuits.length, label: 'Circuits' },
                            { value: new Set(circuits.map(c => (c as any).countryId).filter(Boolean)).size || countries.length, label: 'Pays' },
                            { value: `${minDur}–${maxDur}`, label: 'Jours' },
                        ].map((s, i) => (
                            <div key={i} className="flex items-center gap-8">
                                {i > 0 && <div className="h-8 w-px bg-white/10" />}
                                <div>
                                    <div className="text-2xl font-light text-[#B8962E]"
                                        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                                        {s.value}
                                    </div>
                                    <div className="text-white/40 text-xs font-mono tracking-widest uppercase mt-0.5">
                                        {s.label}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>

            {/* ── CATEGORY PILLS ─────────────────────────────────────── */}
            <div className="bg-white border-b border-[#1B2D5B]/08">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-center gap-1 overflow-x-auto py-3 scrollbar-hide">
                        {availableCategories.map(cat => (
                            <button
                                key={cat.key}
                                onClick={() => setFilterCategory(cat.key)}
                                className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 text-[11px] font-mono tracking-wide uppercase transition-all duration-200 ${filterCategory === cat.key
                                    ? 'bg-[#1B2D5B] text-white'
                                    : 'text-[#1B2D5B]/50 hover:text-[#1B2D5B] hover:bg-[#1B2D5B]/05'
                                    }`}
                            >
                                <span>{cat.emoji}</span>
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── FILTERS BAR ─────────────────────────────────────────── */}
            <div className="sticky top-[64px] md:top-[80px] z-30 bg-white border-b border-[#1B2D5B]/08 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-3">
                    <div className="flex items-center gap-2 flex-wrap">

                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#1B2D5B]/30" />
                            <Input value={search} onChange={e => setSearch(e.target.value)}
                                placeholder={t.search_placeholder}
                                className="pl-9 h-9 w-48 text-xs border-[#1B2D5B]/15 bg-[#F9F7F4] rounded-none" />
                        </div>

                        {/* Country filter */}
                        {countries.length > 0 && (
                            <Select value={filterCountry} onValueChange={(v) => setFilterCountry(v ?? 'all')}>
                                <SelectTrigger className="h-9 w-40 text-xs border-[#1B2D5B]/15 bg-[#F9F7F4] rounded-none">
                                    <Globe className="h-3.5 w-3.5 mr-1.5 text-[#1B2D5B]/40 flex-shrink-0" />
                                    <SelectValue placeholder="Pays" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all" className="text-xs">🌍 Tous les pays</SelectItem>
                                    {countries.map(c => (
                                        <SelectItem key={c.id} value={c.id} className="text-xs">
                                            {(c.flag as string) ?? ''} {getField(c.name as any, locale)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}

                        {/* Duration filter */}
                        <Select value={filterDuration} onValueChange={(v) => setFilterDuration(v ?? 'all')}>
                            <SelectTrigger className="h-9 w-36 text-xs border-[#1B2D5B]/15 bg-[#F9F7F4] rounded-none">
                                <Clock className="h-3.5 w-3.5 mr-1.5 text-[#1B2D5B]/40 flex-shrink-0" />
                                <SelectValue placeholder="Durée" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all" className="text-xs">Toutes durées</SelectItem>
                                <SelectItem value="day" className="text-xs">📅 Journée (1j)</SelectItem>
                                <SelectItem value="short" className="text-xs">⚡ Court (2–5j)</SelectItem>
                                <SelectItem value="medium" className="text-xs">🗓 Séjour (6–10j)</SelectItem>
                                <SelectItem value="long" className="text-xs">🌍 Long (11j+)</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Sort */}
                        <Select value={sort} onValueChange={(v) => setSort(v ?? 'all')}>
                            <SelectTrigger className="h-9 w-44 text-xs border-[#1B2D5B]/15 bg-[#F9F7F4] rounded-none">
                                <SlidersHorizontal className="h-3 w-3 mr-1.5 text-[#1B2D5B]/40" />
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="default" className="text-xs">Ordre par défaut</SelectItem>
                                <SelectItem value="price_asc" className="text-xs">{t.sort_price_asc}</SelectItem>
                                <SelectItem value="price_desc" className="text-xs">{t.sort_price_desc}</SelectItem>
                                <SelectItem value="duration" className="text-xs">{t.sort_duration}</SelectItem>
                            </SelectContent>
                        </Select>

                        {hasFilters && (
                            <Button variant="ghost" size="sm" onClick={clearAll}
                                className="h-9 px-3 text-xs text-red-500 hover:text-red-600 hover:bg-red-50 rounded-none gap-1.5">
                                <X className="h-3 w-3" /> Effacer
                            </Button>
                        )}

                        <span className="ml-auto text-[10px] font-mono text-[#1B2D5B]/30 tracking-wider hidden sm:inline">
                            {filtered.length} circuit{filtered.length !== 1 ? 's' : ''}
                        </span>
                    </div>
                </div>
            </div>

            {/* ── CIRCUITS GRID ────────────────────────────────────────── */}
            <div className="max-w-7xl mx-auto px-6 py-12">
                <AnimatePresence mode="popLayout">
                    {filtered.length === 0 ? (
                        <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="text-center py-24">
                            <div className="text-5xl mb-4">🔍</div>
                            <p className="text-[#1B2D5B]/40 font-light mb-4">{t.no_results}</p>
                            <Button variant="ghost" onClick={clearAll} className="text-[#B8962E]">
                                Effacer les filtres
                            </Button>
                        </motion.div>
                    ) : (
                        <motion.div key="grid"
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filtered.map((circuit, i) => (
                                <CircuitCard
                                    key={circuit.id}
                                    circuit={circuit}
                                    index={i}
                                    t={t}
                                    locale={locale}
                                />
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}

// ─── Circuit Card ──────────────────────────────────────────────────────────

function CircuitCard({
    circuit, index, t, locale,
}: {
    circuit: Circuit
    index: number
    t: Translations
    locale: string
}) {
    const regionStyle = getRegionStyle(circuit.region)
    const durationBadge = getDurationBadge(circuit.duree)
    const name = getField((circuit as any).nomI18n ?? circuit.nom, locale)
    const description = getField((circuit as any).descriptionI18n ?? circuit.description, locale)
    const price = formatPrice(circuit.prix, (circuit as any).currency ?? 'DZD', locale)

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5, delay: index * 0.05, ease: [0.25, 0.46, 0.45, 0.94] }}
            layout
        >
            <Link href={`/circuits/${circuit.id}`}
                className="group block bg-white border border-[#1B2D5B]/08 hover:border-[#B8962E]/30 hover:shadow-[0_8px_30px_rgba(27,45,91,0.08)] transition-all duration-300 overflow-hidden">

                {/* Image */}
                <div className="relative h-52 overflow-hidden bg-[#1B2D5B]/05">
                    {circuit.image ? (
                        <img src={circuit.image} alt={name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#1B2D5B]/10 to-[#B8962E]/10 flex items-center justify-center">
                            <MapPin className="h-8 w-8 text-[#1B2D5B]/20" />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1B2D5B]/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Duration badge */}
                    <div className="absolute top-3 left-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono tracking-wider uppercase border rounded-sm ${durationBadge.color}`}>
                            <Clock className="h-2.5 w-2.5" />
                            {circuit.duree === 1 ? '1 jour' : `${circuit.duree} ${t.days}`}
                        </span>
                    </div>

                    {/* Arrow on hover */}
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                        <div className="w-8 h-8 bg-[#B8962E] flex items-center justify-center">
                            <ArrowRight className="h-4 w-4 text-white" />
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-5">
                    {/* Region tag + category */}
                    <div className="flex items-center justify-between mb-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono tracking-wide border rounded-sm ${regionStyle.bg} ${regionStyle.text} ${regionStyle.border}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${regionStyle.dot}`} />
                            {circuit.region ?? '—'}
                        </span>
                        {(circuit as any).category && (
                            <span className="text-[9px] font-mono tracking-widest text-[#1B2D5B]/25 uppercase">
                                {CATEGORIES.find(c => c.key === (circuit as any).category)?.emoji ?? ''}{' '}
                                {(circuit as any).category}
                            </span>
                        )}
                    </div>

                    {/* Name */}
                    <h2 className="text-lg font-light text-[#1B2D5B] mb-2 leading-snug group-hover:text-[#B8962E] transition-colors duration-300"
                        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                        {name}
                    </h2>

                    {/* Description */}
                    <p className="text-[#1B2D5B]/50 text-xs leading-relaxed line-clamp-2 mb-4 font-light">
                        {description}
                    </p>

                    <div className="h-px bg-[#1B2D5B]/06 mb-4" />

                    {/* Footer */}
                    <div className="flex items-end justify-between">
                        <div>
                            <p className="text-[9px] font-mono tracking-widest text-[#1B2D5B]/30 uppercase mb-0.5">
                                {t.from}
                            </p>
                            <p className="text-xl font-light text-[#B8962E]"
                                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                                {price}
                            </p>
                        </div>
                        <div className="w-8 h-8 bg-[#1B2D5B] group-hover:bg-[#B8962E] flex items-center justify-center transition-all duration-300">
                            <ArrowRight className="h-4 w-4 text-white" />
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    )
}
