// components/CircuitDetailClient.tsx
'use client'

import { useState, useRef } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { useLocale } from 'next-intl'
import dynamic from 'next/dynamic'
import { Link } from '@/lib/navigation'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
    ArrowLeft, MapPin, Clock, Users, Banknote,
    ChevronDown, ChevronUp, CheckCircle, XCircle,
    Star, Calendar, Utensils, Bed, Camera,
    Mountain, ArrowRight,
} from 'lucide-react'
import { getField, formatPrice } from '@/lib/i18n-field'
import type { Circuit } from '@/db/schema'
import ReservationForm from './ReservationForm'

const ItineraryMap = dynamic(() => import('./ItineraryMap'), { ssr: false })

// ── Types ─────────────────────────────────────────────────────────────────

type ItineraryDay = {
    day: number
    title: string
    location: string
    lat: number
    lng: number
    overnight: string
    description: string
    activities: string[]
    meals: string[]
    icon: string
}

type Highlight = {
    icon: string
    title: string
    desc: string
}

type Depart = {
    id: string
    date: Date
    placesMax: number
    placesRestantes: number
    circuitId: string | null
}

// ── Included / Not included ───────────────────────────────────────────────

const INCLUDED = [
    'Transport 4x4 tout au long du circuit',
    'Guide certifié bilingue (FR/AR)',
    'Hébergements sélectionnés',
    'Pension complète (tous les repas)',
    'Eau minérale illimitée',
    'Équipement de bivouac premium',
    "Droits d'entrée sur les sites",
    'Assurance voyage incluse',
]

const NOT_INCLUDED = [
    'Vol aller-retour vers le départ',
    'Boissons alcoolisées',
    'Pourboires et dépenses personnelles',
    'Activités optionnelles',
]

// ── Difficulty ────────────────────────────────────────────────────────────

function getDifficulty(circuit: any) {
    const d = circuit.difficulty ?? ''
    if (d === 'easy') return { label: 'Facile', color: 'text-emerald-600 bg-emerald-50 border-emerald-200', dots: 1 }
    if (d === 'challenging') return { label: 'Aventure', color: 'text-red-600 bg-red-50 border-red-200', dots: 3 }
    if (d === 'expedition') return { label: 'Expédition', color: 'text-purple-600 bg-purple-50 border-purple-200', dots: 4 }
    // default moderate — also handles old circuits with no difficulty field
    const duree = circuit.duree ?? 7
    if (duree <= 5) return { label: 'Facile', color: 'text-emerald-600 bg-emerald-50 border-emerald-200', dots: 1 }
    if (duree <= 8) return { label: 'Modéré', color: 'text-amber-600 bg-amber-50 border-amber-200', dots: 2 }
    return { label: 'Aventure', color: 'text-red-600 bg-red-50 border-red-200', dots: 3 }
}

// ─────────────────────────────────────────────────────────────────────────

export default function CircuitDetailClient({
    circuit,
    departs,
    itinerary,
    highlights,
    locale,
}: {
    circuit: Circuit
    departs: Depart[]
    itinerary: ItineraryDay[]
    highlights: Highlight[]
    locale: string
}) {
    const [activeDay, setActiveDay] = useState<number | null>(1)
    const [mapActiveDay, setMapActiveDay] = useState<number>(1)
    const [showReservation, setShowReservation] = useState(false)

    const heroRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
    const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '40%'])
    const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

    // ✅ i18n name + description
    const name = getField((circuit as any).nomI18n ?? circuit.nom, locale)
    const description = getField((circuit as any).descriptionI18n ?? circuit.description, locale)
    const price = formatPrice(circuit.prix, (circuit as any).currency ?? 'DZD', locale)

    const difficulty = getDifficulty(circuit)
    const firstAvailable = departs.find(d => d.placesRestantes > 0)

    function handleDayClick(day: number) {
        setActiveDay(activeDay === day ? null : day)
        setMapActiveDay(day)
    }

    return (
        <div className="bg-[#F9F7F4] min-h-screen">

            {/* ── HERO ──────────────────────────────────────────────── */}
            <section ref={heroRef} className="relative h-[75vh] overflow-hidden">
                <motion.div className="absolute inset-0" style={{ y: heroY }}>
                    {circuit.image ? (
                        <img
                            src={circuit.image}
                            alt={name}
                            className="w-full h-full object-cover scale-110"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#1B2D5B] via-[#2d4a7a] to-[#B8962E]" />
                    )}
                </motion.div>

                <div className="absolute inset-0 bg-gradient-to-t from-[#080604]/90 via-[#080604]/30 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#080604]/40 to-transparent" />

                {/* Back button */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="absolute top-8 left-6 md:left-10 z-10"
                >
                    <Link
                        href="/circuits"
                        className="inline-flex items-center gap-2 text-white/70 hover:text-white text-xs font-mono tracking-widest uppercase transition-colors bg-black/20 backdrop-blur-sm px-4 py-2 border border-white/10"
                    >
                        <ArrowLeft className="h-3 w-3" />
                        Circuits
                    </Link>
                </motion.div>

                {/* Hero content */}
                <motion.div
                    className="absolute bottom-0 left-0 right-0 p-6 md:p-12"
                    style={{ opacity: heroOpacity }}
                >
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <div className="h-px w-8 bg-[#B8962E]" />
                            <span className="text-[#B8962E] text-[10px] font-mono tracking-[0.4em] uppercase">
                                {circuit.region ?? ''}
                            </span>
                        </div>

                        {/* ✅ i18n name */}
                        <h1
                            className="text-4xl md:text-6xl lg:text-7xl font-light text-white mb-4 leading-tight"
                            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                        >
                            {name}
                        </h1>

                        {/* Quick stats */}
                        <div className="flex flex-wrap items-center gap-3 mt-6">
                            {[
                                { icon: Clock, value: `${circuit.duree} jours` },
                                { icon: MapPin, value: circuit.region ?? '—' },
                                { icon: Users, value: `Max ${departs[0]?.placesMax ?? 12}` },
                                { icon: Banknote, value: price },
                            ].map(stat => (
                                <div key={stat.value} className="flex items-center gap-2 bg-black/30 backdrop-blur-sm border border-white/10 px-3 py-2">
                                    <stat.icon className="h-3.5 w-3.5 text-[#B8962E]" />
                                    <span className="text-white text-xs font-light">{stat.value}</span>
                                </div>
                            ))}
                            <Badge className={`text-[10px] font-mono border px-3 py-1.5 ${difficulty.color}`}>
                                {'●'.repeat(difficulty.dots)}{'○'.repeat(Math.max(0, 3 - difficulty.dots))} {difficulty.label}
                            </Badge>
                        </div>
                    </motion.div>
                </motion.div>
            </section>

            {/* ── MAIN CONTENT ──────────────────────────────────────── */}
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                    {/* ── LEFT: Main content ────────────────────────── */}
                    <div className="lg:col-span-2 space-y-12">

                        {/* Description */}
                        <section>
                            <div className="flex items-center gap-3 mb-5">
                                <div className="h-px w-8 bg-[#B8962E]" />
                                <span className="text-[#B8962E] text-[10px] font-mono tracking-[0.4em] uppercase">À propos</span>
                            </div>
                            {/* ✅ i18n description */}
                            <p className="text-[#1B2D5B]/70 text-base leading-relaxed font-light">
                                {description}
                            </p>
                        </section>

                        {/* Highlights */}
                        <section>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="h-px w-8 bg-[#B8962E]" />
                                <span className="text-[#B8962E] text-[10px] font-mono tracking-[0.4em] uppercase">Points forts</span>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {highlights.map((h, i) => (
                                    <motion.div
                                        key={h.title}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.08 }}
                                        className="bg-white border border-[#1B2D5B]/08 p-5 hover:border-[#B8962E]/30 transition-colors"
                                    >
                                        <span className="text-2xl mb-3 block">{h.icon}</span>
                                        <h3 className="text-sm font-medium text-[#1B2D5B] mb-1">{h.title}</h3>
                                        <p className="text-xs text-[#1B2D5B]/40 font-light leading-relaxed">{h.desc}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </section>

                        {/* Itinerary Timeline */}
                        <section>
                            <div className="flex items-center gap-3 mb-8">
                                <div className="h-px w-8 bg-[#B8962E]" />
                                <span className="text-[#B8962E] text-[10px] font-mono tracking-[0.4em] uppercase">Programme jour par jour</span>
                            </div>

                            <div className="relative">
                                {/* Timeline vertical line */}
                                <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-[#B8962E] via-[#B8962E]/30 to-transparent" />

                                <div className="space-y-2">
                                    {itinerary.map((day, i) => (
                                        <motion.div
                                            key={day.day}
                                            initial={{ opacity: 0, x: -20 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true, margin: '-50px' }}
                                            transition={{ delay: i * 0.06 }}
                                        >
                                            <div className="relative pl-16">
                                                {/* Day circle */}
                                                <div
                                                    className={`absolute left-0 top-4 w-12 h-12 rounded-full flex items-center justify-center text-lg border-2 transition-all duration-300 cursor-pointer z-10 ${activeDay === day.day
                                                            ? 'bg-[#1B2D5B] border-[#B8962E] scale-110'
                                                            : 'bg-white border-[#1B2D5B]/15 hover:border-[#B8962E]/50'
                                                        }`}
                                                    onClick={() => handleDayClick(day.day)}
                                                >
                                                    {day.icon}
                                                </div>

                                                {/* Card */}
                                                <div className={`bg-white border transition-all duration-300 overflow-hidden ${activeDay === day.day
                                                        ? 'border-[#B8962E]/30 shadow-[0_4px_20px_rgba(184,150,46,0.1)]'
                                                        : 'border-[#1B2D5B]/08 hover:border-[#1B2D5B]/15'
                                                    }`}>
                                                    <button
                                                        className="w-full flex items-center justify-between p-5 text-left"
                                                        onClick={() => handleDayClick(day.day)}
                                                    >
                                                        <div>
                                                            <div className="text-[9px] font-mono tracking-[0.3em] text-[#B8962E] uppercase mb-0.5">
                                                                Jour {day.day}
                                                            </div>
                                                            <h3 className="text-base font-light text-[#1B2D5B]"
                                                                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                                                                {day.title}
                                                            </h3>
                                                        </div>
                                                        <div className="flex items-center gap-3 flex-shrink-0">
                                                            <span className="flex items-center gap-1 text-[10px] font-mono text-[#1B2D5B]/40">
                                                                <MapPin className="h-3 w-3" />
                                                                {day.location}
                                                            </span>
                                                            {activeDay === day.day
                                                                ? <ChevronUp className="h-4 w-4 text-[#B8962E]" />
                                                                : <ChevronDown className="h-4 w-4 text-[#1B2D5B]/30" />
                                                            }
                                                        </div>
                                                    </button>

                                                    <AnimatePresence>
                                                        {activeDay === day.day && (
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: 'auto', opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                transition={{ duration: 0.3 }}
                                                            >
                                                                <div className="px-5 pb-5 border-t border-[#1B2D5B]/06">
                                                                    <p className="text-sm text-[#1B2D5B]/60 font-light leading-relaxed mt-4 mb-5">
                                                                        {day.description}
                                                                    </p>
                                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                                        <div>
                                                                            <div className="flex items-center gap-1.5 text-[9px] font-mono tracking-widest text-[#1B2D5B]/30 uppercase mb-2">
                                                                                <Camera className="h-3 w-3" /> Activités
                                                                            </div>
                                                                            <ul className="space-y-1">
                                                                                {day.activities.filter(Boolean).map(a => (
                                                                                    <li key={a} className="flex items-center gap-1.5 text-xs text-[#1B2D5B]/60">
                                                                                        <div className="w-1 h-1 rounded-full bg-[#B8962E] flex-shrink-0" />
                                                                                        {a}
                                                                                    </li>
                                                                                ))}
                                                                            </ul>
                                                                        </div>
                                                                        <div>
                                                                            <div className="flex items-center gap-1.5 text-[9px] font-mono tracking-widest text-[#1B2D5B]/30 uppercase mb-2">
                                                                                <Utensils className="h-3 w-3" /> Repas
                                                                            </div>
                                                                            <ul className="space-y-1">
                                                                                {day.meals.map(m => (
                                                                                    <li key={m} className="flex items-center gap-1.5 text-xs text-[#1B2D5B]/60">
                                                                                        <div className="w-1 h-1 rounded-full bg-emerald-400 flex-shrink-0" />
                                                                                        {m}
                                                                                    </li>
                                                                                ))}
                                                                            </ul>
                                                                        </div>
                                                                        <div>
                                                                            <div className="flex items-center gap-1.5 text-[9px] font-mono tracking-widest text-[#1B2D5B]/30 uppercase mb-2">
                                                                                <Bed className="h-3 w-3" /> Nuit
                                                                            </div>
                                                                            <p className="text-xs text-[#1B2D5B]/60">{day.overnight}</p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* Interactive Map */}
                        {itinerary.length > 0 && (
                            <section>
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="h-px w-8 bg-[#B8962E]" />
                                        <span className="text-[#B8962E] text-[10px] font-mono tracking-[0.4em] uppercase">Carte de l'itinéraire</span>
                                    </div>
                                    <span className="text-[10px] font-mono text-[#1B2D5B]/30">
                                        Cliquez sur un marqueur
                                    </span>
                                </div>
                                <div className="bg-white border border-[#1B2D5B]/08 overflow-hidden">
                                    <ItineraryMap
                                        itinerary={itinerary}
                                        activeDay={mapActiveDay}
                                        onDaySelect={(day) => {
                                            setMapActiveDay(day)
                                            setActiveDay(day)
                                        }}
                                    />
                                </div>
                            </section>
                        )}

                        {/* Included / Not included */}
                        <section>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="h-px w-8 bg-[#B8962E]" />
                                <span className="text-[#B8962E] text-[10px] font-mono tracking-[0.4em] uppercase">Inclus dans le circuit</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white border border-[#1B2D5B]/08 p-6">
                                    <h3 className="text-xs font-mono tracking-widest text-emerald-600 uppercase mb-4 flex items-center gap-2">
                                        <CheckCircle className="h-3.5 w-3.5" /> Inclus
                                    </h3>
                                    <ul className="space-y-2.5">
                                        {INCLUDED.map(item => (
                                            <li key={item} className="flex items-start gap-2.5 text-sm text-[#1B2D5B]/60 font-light">
                                                <CheckCircle className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="bg-white border border-[#1B2D5B]/08 p-6">
                                    <h3 className="text-xs font-mono tracking-widest text-red-500 uppercase mb-4 flex items-center gap-2">
                                        <XCircle className="h-3.5 w-3.5" /> Non inclus
                                    </h3>
                                    <ul className="space-y-2.5">
                                        {NOT_INCLUDED.map(item => (
                                            <li key={item} className="flex items-start gap-2.5 text-sm text-[#1B2D5B]/60 font-light">
                                                <XCircle className="h-3.5 w-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="mt-5 pt-5 border-t border-[#1B2D5B]/06">
                                        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 p-3">
                                            <Banknote className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                                            <p className="text-xs text-amber-700 leading-relaxed">
                                                <strong>Paiement en espèces.</strong> Notre équipe vous contactera pour confirmer.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                    </div>

                    {/* ── RIGHT: Sticky booking panel ───────────────── */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-32 space-y-4">

                            {/* Price card */}
                            <div className="bg-[#1B2D5B] p-6">
                                <div className="flex items-end justify-between mb-4">
                                    <div>
                                        <p className="text-[9px] font-mono tracking-widest text-white/30 uppercase mb-1">À partir de</p>
                                        {/* ✅ formatPrice with correct currency */}
                                        <div className="text-3xl font-light text-[#B8962E]"
                                            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                                            {price}
                                        </div>
                                        <p className="text-[10px] text-white/30 font-mono mt-0.5">par personne</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex gap-0.5 mb-1 justify-end">
                                            {[1, 2, 3, 4, 5].map(s => <Star key={s} className="h-3 w-3 fill-[#B8962E] text-[#B8962E]" />)}
                                        </div>
                                        <p className="text-[9px] font-mono text-white/30">4.9 / 5</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 mb-5">
                                    {[
                                        { icon: Clock, label: 'Durée', value: `${circuit.duree} jours` },
                                        { icon: Mountain, label: 'Difficulté', value: difficulty.label },
                                        { icon: Users, label: 'Groupe', value: `Max ${departs[0]?.placesMax ?? 12}` },
                                        { icon: MapPin, label: 'Départ', value: (circuit.region ?? '').split('·')[0].trim() || '—' },
                                    ].map(s => (
                                        <div key={s.label} className="bg-white/[0.06] p-3">
                                            <div className="flex items-center gap-1.5 text-[#B8962E]/60 text-[9px] font-mono uppercase mb-1">
                                                <s.icon className="h-3 w-3" />{s.label}
                                            </div>
                                            <div className="text-white text-xs font-light">{s.value}</div>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={() => setShowReservation(!showReservation)}
                                    className="w-full h-11 bg-[#B8962E] hover:bg-[#D4AF5A] text-white text-xs tracking-widest font-mono uppercase transition-all duration-300 flex items-center justify-center gap-2"
                                >
                                    {showReservation ? 'Fermer' : 'Réserver ce circuit'}
                                    <ArrowRight className="h-3.5 w-3.5" />
                                </button>
                            </div>

                            {/* Available departures */}
                            {departs.length > 0 && (
                                <div className="bg-white border border-[#1B2D5B]/08 p-5">
                                    <h3 className="text-[10px] font-mono tracking-widest text-[#1B2D5B]/40 uppercase mb-4 flex items-center gap-2">
                                        <Calendar className="h-3.5 w-3.5 text-[#B8962E]" />
                                        Dates disponibles
                                    </h3>
                                    <div className="space-y-2">
                                        {departs.map(depart => {
                                            const isFull = depart.placesRestantes === 0
                                            const isLow = depart.placesRestantes <= 3 && !isFull
                                            return (
                                                <div key={depart.id} className={`p-3 border transition-colors ${isFull ? 'border-[#1B2D5B]/06 opacity-50' : 'border-[#1B2D5B]/10 hover:border-[#B8962E]/30'
                                                    }`}>
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="text-xs font-light text-[#1B2D5B] capitalize">
                                                                {format(new Date(depart.date), 'EEEE d MMMM yyyy', { locale: fr })}
                                                            </p>
                                                            <p className="text-[9px] font-mono text-[#1B2D5B]/30 mt-0.5">
                                                                Retour le {format(new Date(new Date(depart.date).getTime() + circuit.duree * 86400000), 'd MMM yyyy', { locale: fr })}
                                                            </p>
                                                        </div>
                                                        {isFull ? (
                                                            <span className="text-[9px] font-mono text-red-400 bg-red-50 border border-red-100 px-2 py-0.5">Complet</span>
                                                        ) : isLow ? (
                                                            <span className="text-[9px] font-mono text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5">{depart.placesRestantes} places</span>
                                                        ) : (
                                                            <span className="text-[9px] font-mono text-emerald-600">{depart.placesRestantes} places</span>
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Need help */}
                            <div className="bg-[#1B2D5B]/[0.03] border border-[#1B2D5B]/08 p-5">
                                <p className="text-xs font-light text-[#1B2D5B]/60 mb-3">
                                    Besoin d'un conseil ou d'un circuit sur mesure ?
                                </p>
                                <Link
                                    href="/contact"
                                    className="inline-flex items-center gap-2 text-[10px] font-mono tracking-widest text-[#B8962E] uppercase hover:text-[#1B2D5B] transition-colors"
                                >
                                    Contactez-nous <ArrowRight className="h-3 w-3" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reservation form */}
                <AnimatePresence>
                    {showReservation && (
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4 }}
                            className="mt-10 max-w-2xl mx-auto"
                        >
                            <ReservationForm
                                departId={firstAvailable?.id ?? ''}
                                circuitNom={name}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
