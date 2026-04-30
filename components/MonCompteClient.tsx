// components/MonCompteClient.tsx
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UserButton } from '@clerk/nextjs'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
    Calendar,
    MapPin,
    Users,
    Clock,
    Banknote,
    User,
    Mail,
    CheckCircle2,
    XCircle,
    Timer,
    ChevronRight,
    Compass,
    Star,
} from 'lucide-react'
import { Link } from '@/lib/navigation'
import type { Circuit, Reservation } from '@/db/schema'

// ─── Types ────────────────────────────────────────────────────────────────

type Depart = {
    id: string
    date: Date
    placesMax: number
    placesRestantes: number
    circuitId: string | null
}

type UserReservation = {
    reservation: Reservation
    depart: Depart | null
    circuit: Circuit | null
}

type UserData = {
    id: string
    firstName: string
    lastName: string
    email: string
    imageUrl: string
    createdAt: number
}

// ─── Status config ────────────────────────────────────────────────────────

const STATUS = {
    en_attente: {
        label: 'En attente',
        icon: Timer,
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        dot: 'bg-amber-400',
    },
    confirme: {
        label: 'Confirmé',
        icon: CheckCircle2,
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        dot: 'bg-emerald-400',
    },
    annule: {
        label: 'Annulé',
        icon: XCircle,
        bg: 'bg-red-50',
        text: 'text-red-600',
        border: 'border-red-200',
        dot: 'bg-red-400',
    },
}

// ─── Tabs ─────────────────────────────────────────────────────────────────

const TABS = [
    { id: 'overview', label: 'Aperçu' },
    { id: 'reservations', label: 'Mes réservations' },
    { id: 'profile', label: 'Mon profil' },
]

// ─── Main component ───────────────────────────────────────────────────────

export default function MonCompteClient({
    user,
    reservations,
}: {
    user: UserData
    reservations: UserReservation[]
}) {
    const [activeTab, setActiveTab] = useState('overview')

    const confirmed = reservations.filter(r => r.reservation.statut === 'confirme')
    const pending = reservations.filter(r => r.reservation.statut === 'en_attente')
    const cancelled = reservations.filter(r => r.reservation.statut === 'annule')

    const totalSpent = confirmed.reduce((sum, r) => {
        const price = r.circuit?.prix ?? 0
        const people = r.reservation.nombrePersonnes ?? 1
        return sum + price * people
    }, 0)

    const nextTrip = confirmed
        .filter(r => r.depart?.date && new Date(r.depart.date) > new Date())
        .sort((a, b) => new Date(a.depart!.date).getTime() - new Date(b.depart!.date).getTime())[0]

    return (
        <div className="min-h-screen bg-[#F9F7F4]">

            {/* ── Profile header ───────────────────────────────── */}
            <div className="bg-[#1B2D5B] relative overflow-hidden">
                <div className="absolute right-0 top-0 w-96 h-96 rounded-full bg-[#B8962E]/10 blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="relative max-w-5xl mx-auto px-6 py-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex items-center gap-5"
                    >
                        {/* Avatar */}
                        <div className="relative">
                            {user.imageUrl ? (
                                <img
                                    src={user.imageUrl}
                                    alt={user.firstName}
                                    className="w-16 h-16 rounded-full object-cover border-2 border-[#B8962E]/40"
                                />
                            ) : (
                                <div className="w-16 h-16 rounded-full bg-[#B8962E]/20 flex items-center justify-center border-2 border-[#B8962E]/40">
                                    <User className="h-7 w-7 text-[#B8962E]" />
                                </div>
                            )}
                            <div className="absolute -bottom-1 -right-1">
                                <UserButton afterSignOutUrl="/" />
                            </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                                <div className="h-px w-6 bg-[#B8962E]" />
                                <span className="text-[#B8962E] text-[10px] font-mono tracking-[0.3em] uppercase">
                                    Membre Explorea
                                </span>
                            </div>
                            <h1
                                className="text-2xl md:text-3xl font-light text-white"
                                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                            >
                                {user.firstName} {user.lastName}
                            </h1>
                            <p className="text-white/40 text-xs font-mono mt-1">{user.email}</p>
                        </div>

                        {/* Member since */}
                        <div className="hidden md:block text-right">
                            <p className="text-[9px] font-mono tracking-widest text-white/25 uppercase mb-1">
                                Membre depuis
                            </p>
                            <p className="text-white/50 text-sm font-light">
                                {format(new Date(user.createdAt), 'MMMM yyyy', { locale: fr })}
                            </p>
                        </div>
                    </motion.div>

                    {/* Tabs */}
                    <div className="flex items-center gap-0 mt-10 border-b border-white/10">
                        {TABS.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-5 py-3 text-xs font-mono tracking-widest uppercase transition-all duration-200 border-b-2 -mb-px ${activeTab === tab.id
                                        ? 'text-[#B8962E] border-[#B8962E]'
                                        : 'text-white/30 border-transparent hover:text-white/60'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Tab content ──────────────────────────────────── */}
            <div className="max-w-5xl mx-auto px-6 py-10">
                <AnimatePresence mode="wait">

                    {/* OVERVIEW TAB */}
                    {activeTab === 'overview' && (
                        <motion.div
                            key="overview"
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-6"
                        >
                            {/* Stats grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {[
                                    { label: 'Total voyages', value: reservations.length, icon: Compass, color: 'text-[#1B2D5B]' },
                                    { label: 'Confirmés', value: confirmed.length, icon: CheckCircle2, color: 'text-emerald-600' },
                                    { label: 'En attente', value: pending.length, icon: Timer, color: 'text-amber-600' },
                                    { label: 'Annulés', value: cancelled.length, icon: XCircle, color: 'text-red-500' },
                                ].map((stat, i) => (
                                    <motion.div
                                        key={stat.label}
                                        initial={{ opacity: 0, y: 16 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.07 }}
                                        className="bg-white border border-[#1B2D5B]/08 p-5"
                                    >
                                        <stat.icon className={`h-4 w-4 ${stat.color} mb-3 opacity-60`} />
                                        <div
                                            className={`text-3xl font-light ${stat.color} mb-1`}
                                            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                                        >
                                            {stat.value}
                                        </div>
                                        <div className="text-[10px] font-mono tracking-widest text-[#1B2D5B]/30 uppercase">
                                            {stat.label}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Total spent */}
                            {totalSpent > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="bg-[#1B2D5B] p-6 flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-3">
                                        <Banknote className="h-5 w-5 text-[#B8962E]/60" />
                                        <div>
                                            <p className="text-[9px] font-mono tracking-widest text-white/30 uppercase">
                                                Total dépensé
                                            </p>
                                            <p className="text-white/50 text-xs font-mono mt-0.5">
                                                Sur {confirmed.length} voyage{confirmed.length > 1 ? 's' : ''} confirmé{confirmed.length > 1 ? 's' : ''}
                                            </p>
                                        </div>
                                    </div>
                                    <div
                                        className="text-3xl font-light text-[#B8962E]"
                                        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                                    >
                                        {totalSpent.toLocaleString('fr-DZ')}
                                        <span className="text-xs font-mono text-white/30 ml-1">DZD</span>
                                    </div>
                                </motion.div>
                            )}

                            {/* Next trip */}
                            {nextTrip ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.35 }}
                                    className="bg-white border border-[#B8962E]/20 p-6"
                                >
                                    <div className="flex items-center gap-2 mb-4">
                                        <Star className="h-3.5 w-3.5 text-[#B8962E]" />
                                        <span className="text-[10px] font-mono tracking-widest text-[#B8962E] uppercase">
                                            Prochain voyage
                                        </span>
                                    </div>
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-4">
                                            {nextTrip.circuit?.image && (
                                                <img
                                                    src={nextTrip.circuit.image}
                                                    alt={nextTrip.circuit.nom}
                                                    className="w-16 h-12 object-cover flex-shrink-0"
                                                />
                                            )}
                                            <div>
                                                <h3
                                                    className="text-lg font-light text-[#1B2D5B]"
                                                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                                                >
                                                    {nextTrip.circuit?.nom ?? '—'}
                                                </h3>
                                                <div className="flex items-center gap-4 mt-1.5">
                                                    <span className="flex items-center gap-1 text-xs text-[#1B2D5B]/40 font-mono">
                                                        <Calendar className="h-3 w-3" />
                                                        {nextTrip.depart?.date
                                                            ? format(new Date(nextTrip.depart.date), 'd MMMM yyyy', { locale: fr })
                                                            : '—'}
                                                    </span>
                                                    <span className="flex items-center gap-1 text-xs text-[#1B2D5B]/40 font-mono">
                                                        <Users className="h-3 w-3" />
                                                        {nextTrip.reservation.nombrePersonnes} pers.
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <Link
                                            href={`/circuits/${nextTrip.circuit?.id}`}
                                            className="flex items-center gap-1 text-[10px] font-mono tracking-widest text-[#B8962E] uppercase hover:text-[#1B2D5B] transition-colors flex-shrink-0"
                                        >
                                            Voir <ChevronRight className="h-3 w-3" />
                                        </Link>
                                    </div>
                                </motion.div>
                            ) : (
                                reservations.length === 0 && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.3 }}
                                        className="bg-white border border-[#1B2D5B]/08 p-12 text-center"
                                    >
                                        <Compass className="h-10 w-10 text-[#1B2D5B]/10 mx-auto mb-4" />
                                        <p className="text-[#1B2D5B]/40 font-light text-sm mb-4">
                                            Vous n'avez pas encore de réservation
                                        </p>
                                        <Link
                                            href="/circuits"
                                            className="inline-flex items-center gap-2 text-xs font-mono tracking-widest text-[#B8962E] uppercase hover:text-[#1B2D5B] transition-colors border border-[#B8962E]/30 px-5 py-2.5 hover:border-[#1B2D5B]/20"
                                        >
                                            Découvrir nos circuits
                                            <ChevronRight className="h-3 w-3" />
                                        </Link>
                                    </motion.div>
                                )
                            )}

                            {/* Recent reservations preview */}
                            {reservations.length > 0 && (
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-sm font-mono tracking-widest text-[#1B2D5B]/40 uppercase">
                                            Réservations récentes
                                        </h2>
                                        <button
                                            onClick={() => setActiveTab('reservations')}
                                            className="text-[10px] font-mono tracking-widest text-[#B8962E] uppercase hover:text-[#1B2D5B] transition-colors flex items-center gap-1"
                                        >
                                            Voir tout <ChevronRight className="h-3 w-3" />
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        {reservations.slice(0, 3).map((r, i) => (
                                            <ReservationRow key={r.reservation.id} r={r} index={i} />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* RESERVATIONS TAB */}
                    {activeTab === 'reservations' && (
                        <motion.div
                            key="reservations"
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-3"
                        >
                            {reservations.length === 0 ? (
                                <div className="bg-white border border-[#1B2D5B]/08 p-16 text-center">
                                    <Compass className="h-10 w-10 text-[#1B2D5B]/10 mx-auto mb-4" />
                                    <p className="text-[#1B2D5B]/40 text-sm font-light mb-4">
                                        Aucune réservation pour le moment
                                    </p>
                                    <Link
                                        href="/circuits"
                                        className="inline-flex items-center gap-2 text-xs font-mono tracking-widest text-[#B8962E] uppercase border border-[#B8962E]/30 px-5 py-2.5 hover:bg-[#B8962E]/5 transition-colors"
                                    >
                                        Explorer nos circuits <ChevronRight className="h-3 w-3" />
                                    </Link>
                                </div>
                            ) : (
                                reservations.map((r, i) => (
                                    <ReservationCard key={r.reservation.id} r={r} index={i} />
                                ))
                            )}
                        </motion.div>
                    )}

                    {/* PROFILE TAB */}
                    {activeTab === 'profile' && (
                        <motion.div
                            key="profile"
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-4"
                        >
                            <div className="bg-white border border-[#1B2D5B]/08">
                                {/* Section header */}
                                <div className="px-6 py-4 border-b border-[#1B2D5B]/06 flex items-center justify-between">
                                    <div>
                                        <h2 className="text-sm font-light text-[#1B2D5B]"
                                            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                                            Informations personnelles
                                        </h2>
                                        <p className="text-[10px] font-mono text-[#1B2D5B]/30 mt-0.5">
                                            Lecture seule — modification disponible prochainement
                                        </p>
                                    </div>
                                    <span className="text-[9px] font-mono tracking-widest text-[#B8962E]/60 uppercase border border-[#B8962E]/20 px-2 py-1">
                                        Bientôt modifiable
                                    </span>
                                </div>

                                {/* Fields */}
                                <div className="divide-y divide-[#1B2D5B]/04">
                                    {[
                                        { icon: User, label: 'Prénom', value: user.firstName || '—' },
                                        { icon: User, label: 'Nom', value: user.lastName || '—' },
                                        { icon: Mail, label: 'Email', value: user.email || '—' },
                                        {
                                            icon: Calendar,
                                            label: 'Membre depuis',
                                            value: format(new Date(user.createdAt), 'd MMMM yyyy', { locale: fr })
                                        },
                                    ].map(field => (
                                        <div key={field.label} className="px-6 py-4 flex items-center gap-4">
                                            <div className="w-8 h-8 bg-[#1B2D5B]/04 flex items-center justify-center flex-shrink-0">
                                                <field.icon className="h-3.5 w-3.5 text-[#B8962E]/50" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-[9px] font-mono tracking-widest text-[#1B2D5B]/30 uppercase mb-0.5">
                                                    {field.label}
                                                </p>
                                                <p className="text-sm font-light text-[#1B2D5B]">
                                                    {field.value}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Security section */}
                            <div className="bg-white border border-[#1B2D5B]/08">
                                <div className="px-6 py-4 border-b border-[#1B2D5B]/06">
                                    <h2 className="text-sm font-light text-[#1B2D5B]"
                                        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                                        Sécurité du compte
                                    </h2>
                                    <p className="text-[10px] font-mono text-[#1B2D5B]/30 mt-0.5">
                                        Géré par Clerk
                                    </p>
                                </div>
                                <div className="px-6 py-5 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-light text-[#1B2D5B]">
                                            Mot de passe & sécurité
                                        </p>
                                        <p className="text-[10px] font-mono text-[#1B2D5B]/30 mt-0.5">
                                            Modifier via le menu compte
                                        </p>
                                    </div>
                                    <UserButton afterSignOutUrl="/" />
                                </div>
                            </div>

                            {/* Note about future editing */}
                            <div className="bg-[#1B2D5B]/[0.03] border border-[#1B2D5B]/08 px-5 py-4 flex items-start gap-3">
                                <div className="w-1 h-full bg-[#B8962E]/40 flex-shrink-0 self-stretch" />
                                <p className="text-xs text-[#1B2D5B]/40 font-light leading-relaxed">
                                    La modification du profil (téléphone, wilaya, préférences de voyage) sera disponible prochainement.
                                    Contactez-nous si vous avez besoin de mettre à jour vos informations.
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}

// ─── Reservation Row (compact) ────────────────────────────────────────────

function ReservationRow({ r, index }: { r: UserReservation; index: number }) {
    const statut = (r.reservation.statut ?? 'en_attente') as keyof typeof STATUS
    const s = STATUS[statut] || STATUS.en_attente

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.06 }}
            className="bg-white border border-[#1B2D5B]/08 px-5 py-3.5 flex items-center gap-4 hover:border-[#B8962E]/20 transition-colors"
        >
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${s.dot}`} />
            <div className="flex-1 min-w-0">
                <p className="text-sm font-light text-[#1B2D5B] truncate">
                    {r.circuit?.nom ?? '—'}
                </p>
                <p className="text-[10px] font-mono text-[#1B2D5B]/30 mt-0.5">
                    {r.depart?.date
                        ? format(new Date(r.depart.date), 'd MMM yyyy', { locale: fr })
                        : '—'}
                    {' · '}
                    {r.reservation.nombrePersonnes} pers.
                </p>
            </div>
            <span className={`text-[9px] font-mono tracking-wider uppercase px-2 py-1 border ${s.bg} ${s.text} ${s.border}`}>
                {s.label}
            </span>
        </motion.div>
    )
}

// ─── Reservation Card (full) ──────────────────────────────────────────────

function ReservationCard({ r, index }: { r: UserReservation; index: number }) {
    const statut = (r.reservation.statut ?? 'en_attente') as keyof typeof STATUS
    const s = STATUS[statut] || STATUS.en_attente
    const StatusIcon = s.icon

    const departDate = r.depart?.date ? new Date(r.depart.date) : null
    const returnDate = departDate && r.circuit?.duree
        ? new Date(departDate.getTime() + r.circuit.duree * 86400000)
        : null
    const isPast = departDate ? departDate < new Date() : false

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.07 }}
            className={`bg-white border transition-colors ${isPast && statut !== 'annule'
                    ? 'border-[#1B2D5B]/06 opacity-70'
                    : 'border-[#1B2D5B]/08 hover:border-[#B8962E]/20'
                }`}
        >
            <div className="p-5">
                <div className="flex items-start gap-4">
                    {/* Circuit image */}
                    {r.circuit?.image ? (
                        <img
                            src={r.circuit.image}
                            alt={r.circuit.nom}
                            className="w-20 h-14 object-cover flex-shrink-0"
                        />
                    ) : (
                        <div className="w-20 h-14 bg-[#1B2D5B]/05 flex items-center justify-center flex-shrink-0">
                            <MapPin className="h-5 w-5 text-[#1B2D5B]/15" />
                        </div>
                    )}

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-2">
                            <div>
                                <p className="text-[9px] font-mono tracking-[0.3em] text-[#B8962E]/60 uppercase mb-0.5">
                                    {r.circuit?.region ?? ''}
                                </p>
                                <h3
                                    className="text-base font-light text-[#1B2D5B] leading-tight"
                                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                                >
                                    {r.circuit?.nom ?? '—'}
                                </h3>
                            </div>
                            <span className={`inline-flex items-center gap-1.5 text-[9px] font-mono tracking-wider uppercase px-2.5 py-1 border flex-shrink-0 ${s.bg} ${s.text} ${s.border}`}>
                                <StatusIcon className="h-2.5 w-2.5" />
                                {s.label}
                            </span>
                        </div>

                        {/* Details grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                            <div>
                                <p className="text-[9px] font-mono tracking-widest text-[#1B2D5B]/25 uppercase mb-0.5">Départ</p>
                                <p className="text-xs font-light text-[#1B2D5B]">
                                    {departDate
                                        ? format(departDate, 'd MMM yyyy', { locale: fr })
                                        : '—'}
                                </p>
                            </div>
                            <div>
                                <p className="text-[9px] font-mono tracking-widest text-[#1B2D5B]/25 uppercase mb-0.5">Retour</p>
                                <p className="text-xs font-light text-[#1B2D5B]">
                                    {returnDate
                                        ? format(returnDate, 'd MMM yyyy', { locale: fr })
                                        : '—'}
                                </p>
                            </div>
                            <div>
                                <p className="text-[9px] font-mono tracking-widest text-[#1B2D5B]/25 uppercase mb-0.5">Personnes</p>
                                <p className="text-xs font-light text-[#1B2D5B]">
                                    {r.reservation.nombrePersonnes}
                                </p>
                            </div>
                            <div>
                                <p className="text-[9px] font-mono tracking-widest text-[#1B2D5B]/25 uppercase mb-0.5">Durée</p>
                                <p className="text-xs font-light text-[#1B2D5B]">
                                    {r.circuit?.duree ?? '—'} jours
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#1B2D5B]/04">
                    <div>
                        <p className="text-[9px] font-mono tracking-widest text-[#1B2D5B]/25 uppercase">
                            Total estimé
                        </p>
                        <p
                            className="text-lg font-light text-[#B8962E]"
                            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                        >
                            {((r.circuit?.prix ?? 0) * r.reservation.nombrePersonnes).toLocaleString('fr-DZ')}
                            <span className="text-xs font-mono text-[#1B2D5B]/25 ml-1">DZD</span>
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        {r.reservation.notes && (
                            <span className="text-[9px] font-mono text-[#1B2D5B]/30 max-w-[160px] truncate hidden md:block">
                                Note: {r.reservation.notes}
                            </span>
                        )}
                        {statut === 'en_attente' && (
                            <span className="text-[9px] font-mono text-amber-600 bg-amber-50 border border-amber-100 px-2 py-1">
                                En attente de confirmation par notre équipe
                            </span>
                        )}
                        {statut === 'confirme' && !isPast && (
                            <span className="text-[9px] font-mono text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-1">
                                ✓ Paiement à confirmer en espèces
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
