// components/CircuitsClient.tsx
'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from '@/lib/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    MapPin,
    Clock,
    Users,
    ArrowRight,
    Search,
    SlidersHorizontal,
    X,
} from 'lucide-react'
import type { Circuit } from '@/db/schema'

// ─── Region tag color mapping ──────────────────────────────────────────────

function getRegionStyle(region: string) {
    const r = region.toLowerCase()
    if (r.includes('tamanrasset') || r.includes('ouargla') || r.includes('djanet') || r.includes('hoggar') || r.includes('tadrart') || r.includes('timimoun') || r.includes('béchar') || r.includes('adrar'))
        return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-400' }
    if (r.includes('alger') || r.includes('béjaïa') || r.includes('oran') || r.includes('tlemcen') || r.includes('constantine') || r.includes('annaba'))
        return { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200', dot: 'bg-sky-400' }
    if (r.includes('ghardaïa') || r.includes('batna') || r.includes('sétif') || r.includes('m\'zab'))
        return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-400' }
    return { bg: 'bg-[#1B2D5B]/5', text: 'text-[#1B2D5B]', border: 'border-[#1B2D5B]/15', dot: 'bg-[#1B2D5B]' }
}

function getDurationBadge(duree: number) {
    if (duree <= 5) return { label: 'Court séjour', color: 'text-violet-600 bg-violet-50 border-violet-200' }
    if (duree <= 8) return { label: 'Séjour', color: 'text-blue-600 bg-blue-50 border-blue-200' }
    return { label: 'Grand circuit', color: 'text-orange-600 bg-orange-50 border-orange-200' }
}

type Translations = {
    title: string
    subtitle: string
    days: string
    price: string
    book: string
    available_seats: string
    filter_all: string
    filter_sahara: string
    filter_nord: string
    filter_culturel: string
    sort_price_asc: string
    sort_price_desc: string
    sort_duration: string
    no_results: string
    from: string
    search_placeholder: string
}

// ─── Main component ────────────────────────────────────────────────────────

export default function CircuitsClient({
    circuits,
    translations: t,
}: {
    circuits: Circuit[]
    translations: Translations
}) {
    const [search, setSearch] = useState('')
    const [filter, setFilter] = useState('all')
    const [sort, setSort] = useState('default')
    const [showFilters, setShowFilters] = useState(false)

    const FILTERS = [
        { key: 'all', label: t.filter_all },
        { key: 'sahara', label: t.filter_sahara },
        { key: 'nord', label: t.filter_nord },
        { key: 'culturel', label: t.filter_culturel },
    ]

    const filtered = useMemo(() => {
        let result = [...circuits]

        // Search
        if (search.trim()) {
            const q = search.toLowerCase()
            result = result.filter(c =>
                c.nom.toLowerCase().includes(q) ||
                c.region.toLowerCase().includes(q) ||
                c.description.toLowerCase().includes(q)
            )
        }

        // Filter by type
        if (filter === 'sahara') {
            result = result.filter(c =>
                ['tamanrasset', 'ouargla', 'djanet', 'hoggar', 'adrar', 'béchar', 'timimoun', 'tadrart']
                    .some(k => c.region.toLowerCase().includes(k))
            )
        } else if (filter === 'nord') {
            result = result.filter(c =>
                ['alger', 'béjaïa', 'oran', 'tlemcen', 'constantine', 'annaba', 'skikda']
                    .some(k => c.region.toLowerCase().includes(k))
            )
        } else if (filter === 'culturel') {
            result = result.filter(c =>
                ['ghardaïa', 'batna', 'sétif', 'm\'zab', 'tlemcen', 'constantine']
                    .some(k => c.region.toLowerCase().includes(k))
            )
        }

        // Sort
        if (sort === 'price_asc') result.sort((a, b) => a.prix - b.prix)
        else if (sort === 'price_desc') result.sort((a, b) => b.prix - a.prix)
        else if (sort === 'duration') result.sort((a, b) => a.duree - b.duree)

        return result
    }, [circuits, search, filter, sort])

    const hasActiveFilters = search || filter !== 'all' || sort !== 'default'

    function clearAll() {
        setSearch('')
        setFilter('all')
        setSort('default')
    }

    return (
        <div className="min-h-screen bg-[#F9F7F4]">

            {/* ── PAGE HEADER ─────────────────────────────────────────── */}
            <div className="bg-[#1B2D5B] relative overflow-hidden">
                {/* Geometric decoration */}
                <div className="absolute inset-0 opacity-[0.04]"
                    style={{
                        backgroundImage: 'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)',
                        backgroundSize: '24px 24px',
                    }}
                />
                <div className="absolute right-0 top-0 w-96 h-96 rounded-full bg-[#B8962E]/10 blur-3xl -translate-y-1/2 translate-x-1/2" />

                <div className="relative max-w-7xl mx-auto px-6 py-20 md:py-28">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
                    >
                        <div className="flex items-center gap-3 mb-5">
                            <div className="h-px w-10 bg-[#B8962E]" />
                            <span className="text-[#B8962E] text-xs font-mono tracking-[0.4em] uppercase">
                                Explorea · Algérie
                            </span>
                        </div>
                        <h1
                            className="text-4xl md:text-6xl font-light text-white mb-4 leading-tight"
                            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                        >
                            {t.title}
                        </h1>
                        <p className="text-white/50 text-base max-w-xl leading-relaxed font-light">
                            {t.subtitle}
                        </p>
                    </motion.div>

                    {/* Stats row */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="flex items-center gap-8 mt-10 pt-8 border-t border-white/10"
                    >
                        <div>
                            <div className="text-2xl font-light text-[#B8962E]"
                                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                                {circuits.length}
                            </div>
                            <div className="text-white/40 text-xs font-mono tracking-widest uppercase mt-0.5">Circuits</div>
                        </div>
                        <div className="h-8 w-px bg-white/10" />
                        <div>
                            <div className="text-2xl font-light text-[#B8962E]"
                                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                                12
                            </div>
                            <div className="text-white/40 text-xs font-mono tracking-widest uppercase mt-0.5">Wilayas</div>
                        </div>
                        <div className="h-8 w-px bg-white/10" />
                        <div>
                            <div className="text-2xl font-light text-[#B8962E]"
                                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                                4–21
                            </div>
                            <div className="text-white/40 text-xs font-mono tracking-widest uppercase mt-0.5">Jours</div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* ── FILTERS BAR ─────────────────────────────────────────── */}
            <div className="sticky top-[64px] md:top-[80px] z-30 bg-white border-b border-[#1B2D5B]/08 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-3">
                    <div className="flex items-center gap-3">

                        {/* Search */}
                        <div className="relative flex-1 max-w-xs">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#1B2D5B]/30" />
                            <Input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder={t.search_placeholder}
                                className="pl-9 h-9 text-xs border-[#1B2D5B]/15 bg-[#F9F7F4] focus-visible:ring-[#B8962E]/30 rounded-sm"
                            />
                        </div>

                        {/* Filter pills */}
                        <div className="hidden md:flex items-center gap-1.5">
                            {FILTERS.map(f => (
                                <button
                                    key={f.key}
                                    onClick={() => setFilter(f.key)}
                                    className={`px-3.5 py-1.5 text-[11px] font-mono tracking-wide uppercase rounded-sm transition-all duration-200 ${filter === f.key
                                        ? 'bg-[#1B2D5B] text-white'
                                        : 'bg-transparent text-[#1B2D5B]/50 hover:text-[#1B2D5B] hover:bg-[#1B2D5B]/05'
                                        }`}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>

                        <div className="ml-auto flex items-center gap-2">
                            {/* Sort */}
                            <Select value={sort} onValueChange={setSort}>
                                <SelectTrigger className="h-9 w-44 text-xs border-[#1B2D5B]/15 bg-[#F9F7F4] rounded-sm">
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

                            {/* Clear */}
                            {hasActiveFilters && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearAll}
                                    className="h-9 px-3 text-xs text-red-500 hover:text-red-600 hover:bg-red-50 rounded-sm gap-1.5"
                                >
                                    <X className="h-3 w-3" />
                                    Effacer
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Result count */}
                    <div className="flex items-center justify-between mt-2">
                        <p className="text-[10px] font-mono text-[#1B2D5B]/30 tracking-wider">
                            {filtered.length} circuit{filtered.length > 1 ? 's' : ''} trouvé{filtered.length > 1 ? 's' : ''}
                        </p>
                    </div>
                </div>
            </div>

            {/* ── CIRCUITS GRID ────────────────────────────────────────── */}
            <div className="max-w-7xl mx-auto px-6 py-12">
                <AnimatePresence mode="popLayout">
                    {filtered.length === 0 ? (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-24"
                        >
                            <div className="text-5xl mb-4">🔍</div>
                            <p className="text-[#1B2D5B]/40 font-light">{t.no_results}</p>
                            <Button variant="ghost" onClick={clearAll} className="mt-4 text-[#B8962E]">
                                Effacer les filtres
                            </Button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="grid"
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                            {filtered.map((circuit, i) => (
                                <CircuitCard
                                    key={circuit.id}
                                    circuit={circuit}
                                    index={i}
                                    t={t}
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
    circuit,
    index,
    t,
}: {
    circuit: Circuit
    index: number
    t: Translations
}) {
    const regionStyle = getRegionStyle(circuit.region)
    const durationBadge = getDurationBadge(circuit.duree)

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{
                duration: 0.5,
                delay: index * 0.06,
                ease: [0.25, 0.46, 0.45, 0.94],
            }}
            layout
        >
            <Link href={`/circuits/${circuit.id}`} className="group block bg-white border border-[#1B2D5B]/08 hover:border-[#B8962E]/30 hover:shadow-[0_8px_30px_rgba(27,45,91,0.08)] transition-all duration-400 overflow-hidden">

                {/* Image */}
                <div className="relative h-52 overflow-hidden bg-[#1B2D5B]/5">
                    {circuit.image ? (
                        <img
                            src={circuit.image}
                            alt={circuit.nom}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#1B2D5B]/10 to-[#B8962E]/10 flex items-center justify-center">
                            <MapPin className="h-8 w-8 text-[#1B2D5B]/20" />
                        </div>
                    )}

                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1B2D5B]/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />

                    {/* Duration badge — top left */}
                    <div className="absolute top-3 left-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono tracking-wider uppercase border rounded-sm ${durationBadge.color}`}>
                            <Clock className="h-2.5 w-2.5" />
                            {circuit.duree} {t.days}
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
                    </div>

                    {/* Title */}
                    <h2
                        className="text-lg font-light text-[#1B2D5B] mb-2 leading-snug group-hover:text-[#B8962E] transition-colors duration-300"
                        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                    >
                        {circuit.nom}
                    </h2>

                    {/* Description */}
                    <p className="text-[#1B2D5B]/50 text-xs leading-relaxed line-clamp-2 mb-4 font-light">
                        {circuit.description}
                    </p>

                    {/* Divider */}
                    <div className="h-px bg-[#1B2D5B]/06 mb-4" />

                    {/* Footer */}
                    <div className="flex items-end justify-between">
                        <div>
                            <p className="text-[9px] font-mono tracking-widest text-[#1B2D5B]/30 uppercase mb-0.5">
                                {t.from}
                            </p>
                            <p
                                className="text-xl font-light text-[#B8962E]"
                                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                            >
                                {circuit.prix.toLocaleString('fr-DZ')}
                                <span className="text-xs text-[#1B2D5B]/30 font-mono ml-1">DZD</span>
                            </p>
                        </div>
                        <Button
                            size="sm"
                            className="rounded-none bg-[#1B2D5B] hover:bg-[#B8962E] text-white text-[10px] tracking-widest font-light h-8 px-4 transition-all duration-300"
                        >
                            {t.book}
                        </Button>
                    </div>
                </div>
            </Link>
        </motion.div>
    )
}
