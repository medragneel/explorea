// components/DestinationsClient.tsx
'use client'

import { useState, useMemo } from 'react'
import { useLocale } from 'next-intl'
import { motion } from 'framer-motion'
import { Link } from '@/lib/navigation'
import { getField } from '@/lib/i18n-field'
import { Input } from '@/components/ui/input'
import { ArrowRight, Search, Globe, MapPin } from 'lucide-react'

const EASE = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number]

// Continent colors
const CONTINENT_STYLE: Record<string, { bg: string; text: string; border: string }> = {
    'Africa': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    'Asia': { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200' },
    'Europe': { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' },
    'South America': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    'North America': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    'Oceania': { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
}

type CountryWithCount = {
    id: string
    code: string
    name: unknown
    continent: string
    currency: string
    flag: unknown
    image: unknown
    actif: boolean | null
    circuitCount: number
}

// Default country images by code
const DEFAULT_IMAGES: Record<string, string> = {
    DZ: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800',
    MA: 'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=800',
    TN: 'https://images.unsplash.com/photo-1539635278303-d4002c07eae3?w=800',
    EG: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=800',
    JO: 'https://images.unsplash.com/photo-1579033461380-adb47c3eb938?w=800',
    KE: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800',
    ZA: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800',
    IS: 'https://images.unsplash.com/photo-1520769945061-0a448c463865?w=800',
    NP: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800',
    PE: 'https://images.unsplash.com/photo-1580502304784-8985b7eb7260?w=800',
    ET: 'https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=800',
}

export default function DestinationsClient({ countries }: { countries: CountryWithCount[] }) {
    const locale = useLocale()
    const [search, setSearch] = useState('')
    const [activeContinent, setActiveContinent] = useState('all')

    const continents = useMemo(() => {
        const set = new Set(countries.map(c => c.continent))
        return ['all', ...Array.from(set).sort()]
    }, [countries])

    const filtered = useMemo(() => {
        let result = [...countries]
        if (search.trim()) {
            const q = search.toLowerCase()
            result = result.filter(c => {
                const name = getField(c.name, locale)
                return name.toLowerCase().includes(q) ||
                    c.code.toLowerCase().includes(q) ||
                    c.continent.toLowerCase().includes(q)
            })
        }
        if (activeContinent !== 'all') {
            result = result.filter(c => c.continent === activeContinent)
        }
        // Sort: countries with circuits first
        result.sort((a, b) => b.circuitCount - a.circuitCount)
        return result
    }, [countries, search, activeContinent, locale])

    const totalCircuits = countries.reduce((s, c) => s + c.circuitCount, 0)

    return (
        <div className="min-h-screen bg-[#F9F7F4]">

            {/* ── HERO HEADER ───────────────────────────────────────── */}
            <div className="bg-[#1B2D5B] relative overflow-hidden">
                {/* Grid pattern */}
                <div className="absolute inset-0 opacity-[0.04]" style={{
                    backgroundImage: 'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)',
                    backgroundSize: '24px 24px',
                }} />
                <div className="absolute right-0 top-0 w-[500px] h-[500px] rounded-full bg-[#B8962E]/10 blur-3xl -translate-y-1/2 translate-x-1/3" />
                <div className="absolute left-0 bottom-0 w-64 h-64 rounded-full bg-[#B8962E]/5 blur-3xl translate-y-1/2 -translate-x-1/3" />

                <div className="relative max-w-7xl mx-auto px-6 py-20 md:py-28">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, ease: EASE }}
                    >
                        <div className="flex items-center gap-3 mb-5">
                            <div className="h-px w-10 bg-[#B8962E]" />
                            <span className="text-[#B8962E] text-xs font-mono tracking-[0.4em] uppercase">
                                Explorea · Monde
                            </span>
                        </div>
                        <h1
                            className="text-4xl md:text-6xl lg:text-7xl font-light text-white mb-4 leading-tight"
                            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                        >
                            Destinations
                            <br />
                            <em className="text-[#B8962E]">mondiales</em>
                        </h1>
                        <p className="text-white/50 text-base max-w-xl leading-relaxed font-light">
                            Des déserts sahariens aux sommets himalayens — des expériences authentiques dans les plus beaux endroits du monde.
                        </p>
                    </motion.div>

                    {/* Stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="flex items-center gap-8 mt-10 pt-8 border-t border-white/10"
                    >
                        {[
                            { value: countries.length, label: 'Destinations' },
                            { value: totalCircuits, label: 'Circuits' },
                            { value: continents.length - 1, label: 'Continents' },
                        ].map((s, i) => (
                            <div key={i} className="flex items-center gap-8">
                                {i > 0 && <div className="h-8 w-px bg-white/10" />}
                                <div>
                                    <div
                                        className="text-2xl font-light text-[#B8962E]"
                                        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                                    >
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

            {/* ── FILTERS ───────────────────────────────────────────── */}
            <div className="sticky top-[64px] md:top-[80px] z-30 bg-white border-b border-[#1B2D5B]/08 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-4 flex-wrap">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#1B2D5B]/30" />
                        <Input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Rechercher une destination..."
                            className="pl-9 h-9 w-52 text-xs border-[#1B2D5B]/15 bg-[#F9F7F4] rounded-sm"
                        />
                    </div>

                    {/* Continent pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto">
                        {continents.map(c => (
                            <button
                                key={c}
                                onClick={() => setActiveContinent(c)}
                                className={`flex-shrink-0 px-3.5 py-1.5 text-[11px] font-mono tracking-wide uppercase rounded-sm transition-all duration-200 ${activeContinent === c
                                        ? 'bg-[#1B2D5B] text-white'
                                        : 'text-[#1B2D5B]/50 hover:text-[#1B2D5B] hover:bg-[#1B2D5B]/5'
                                    }`}
                            >
                                {c === 'all' ? '🌍 Tous' : c}
                            </button>
                        ))}
                    </div>

                    <span className="ml-auto text-[10px] font-mono text-[#1B2D5B]/30 tracking-wider">
                        {filtered.length} destination{filtered.length !== 1 ? 's' : ''}
                    </span>
                </div>
            </div>

            {/* ── COUNTRIES GRID ────────────────────────────────────── */}
            <div className="max-w-7xl mx-auto px-6 py-12">
                {filtered.length === 0 ? (
                    <div className="text-center py-24">
                        <Globe className="h-12 w-12 text-[#1B2D5B]/10 mx-auto mb-4" />
                        <p className="text-[#1B2D5B]/40 font-light">Aucune destination trouvée</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {filtered.map((country, i) => {
                            const name = getField(country.name, locale)
                            const style = CONTINENT_STYLE[country.continent] ?? CONTINENT_STYLE['Africa']
                            const img = (country.image as string) || DEFAULT_IMAGES[country.code] || null
                            const hasCircuits = country.circuitCount > 0

                            return (
                                <motion.div
                                    key={country.id}
                                    initial={{ opacity: 0, y: 24 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: i * 0.05, ease: EASE }}
                                >
                                    <Link
                                        href={`/destinations/${country.code.toLowerCase()}`}
                                        className={`group block bg-white border overflow-hidden transition-all duration-400 ${hasCircuits
                                                ? 'border-[#1B2D5B]/08 hover:border-[#B8962E]/30 hover:shadow-[0_8px_30px_rgba(27,45,91,0.08)] cursor-pointer'
                                                : 'border-[#1B2D5B]/05 opacity-60 cursor-default pointer-events-none'
                                            }`}
                                    >
                                        {/* Image */}
                                        <div className="relative h-44 overflow-hidden bg-[#1B2D5B]/5">
                                            {img ? (
                                                <img
                                                    src={img}
                                                    alt={name}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-[#1B2D5B]/10 to-[#B8962E]/10 flex items-center justify-center">
                                                    <span className="text-5xl">
                                                        {(country.flag as string) ?? '🌍'}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-[#1B2D5B]/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />

                                            {/* Flag overlay */}
                                            <div className="absolute top-3 left-3 text-2xl">
                                                {(country.flag as string) ?? ''}
                                            </div>

                                            {/* Arrow */}
                                            {hasCircuits && (
                                                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                                                    <div className="w-7 h-7 bg-[#B8962E] flex items-center justify-center">
                                                        <ArrowRight className="h-3.5 w-3.5 text-white" />
                                                    </div>
                                                </div>
                                            )}

                                            {/* Circuit count badge */}
                                            {hasCircuits && (
                                                <div className="absolute bottom-3 right-3">
                                                    <span className="bg-[#1B2D5B]/80 backdrop-blur-sm text-white text-[9px] font-mono px-2 py-1 tracking-widest">
                                                        {country.circuitCount} circuit{country.circuitCount > 1 ? 's' : ''}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Coming soon */}
                                            {!hasCircuits && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-[#1B2D5B]/20">
                                                    <span className="text-[9px] font-mono tracking-[0.3em] text-white/70 uppercase bg-[#1B2D5B]/60 px-3 py-1.5">
                                                        Bientôt
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className={`text-[9px] font-mono tracking-widest uppercase px-2 py-0.5 border rounded-sm ${style.bg} ${style.text} ${style.border}`}>
                                                    {country.continent}
                                                </span>
                                                <span className="text-[9px] font-mono text-[#1B2D5B]/25 uppercase tracking-widest">
                                                    {country.currency}
                                                </span>
                                            </div>

                                            <h2
                                                className="text-base font-light text-[#1B2D5B] group-hover:text-[#B8962E] transition-colors duration-300"
                                                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                                            >
                                                {name}
                                            </h2>

                                            {hasCircuits && (
                                                <p className="text-[10px] font-mono text-[#1B2D5B]/30 mt-1 flex items-center gap-1">
                                                    <MapPin className="h-2.5 w-2.5" />
                                                    {country.circuitCount} circuit{country.circuitCount > 1 ? 's' : ''} disponible{country.circuitCount > 1 ? 's' : ''}
                                                </p>
                                            )}
                                        </div>
                                    </Link>
                                </motion.div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
