'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useTranslations, useLocale } from 'next-intl'
import { useUser, UserButton } from '@clerk/nextjs'
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion'
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuList,
    NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
import {
    Menu,
    MapPin,
    Compass,
    Tent,
    Camera,
    Phone,
    ChevronRight,
    X,
} from 'lucide-react'
import { Link } from '@/lib/navigation'
import LanguageSwitcher from './LanguageSwitcher'

export default function Navbar() {
    const t = useTranslations('nav')
    const locale = useLocale()
    const { isSignedIn } = useUser()
    const [scrolled, setScrolled] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)
    const { scrollY } = useScroll()

    useMotionValueEvent(scrollY, 'change', (latest) => {
        setScrolled(latest > 40)
    })

    // ✅ Destinations use translated names but fixed slugs
    const DESTINATIONS = [
        { name: 'Grand Erg Oriental', region: 'Ouargla', icon: Compass, days: '8 jours', slug: 'grand-erg-oriental' },
        { name: "Tassili n'Ajjer", region: 'Djanet · UNESCO', icon: Camera, days: '10 jours', slug: 'tassili-najjer' },
        { name: "Route des Ksour", region: "Ghardaïa · M'Zab", icon: MapPin, days: '6 jours', slug: 'route-des-ksour' },
        { name: 'Casbah & Côte', region: 'Alger · Béjaïa', icon: Tent, days: '5 jours', slug: 'casbah-cote' },
    ]

    return (
        <>
            <motion.header
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
                    ? 'bg-white shadow-[0_2px_20px_rgba(0,0,0,0.08)]'
                    : 'bg-white border-b border-[#B8962E]/15'
                    }`}
            >
                {/* ── TOP MICRO-BAR ─────────────────────────────────────── */}
                <AnimatePresence>
                    {!scrolled && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden bg-[#1B2D5B]"
                        >
                            <div className="max-w-7xl mx-auto px-6 py-1.5 flex items-center justify-between">
                                <div className="flex items-center gap-1.5 text-white">
                                    <Phone className="h-3 w-3" />
                                    {/* ✅ translated */}
                                    <span className="text-[10px] font-mono tracking-widest">{t('phone')}</span>
                                </div>
                                <span className="text-[10px] font-mono tracking-[0.3em] text-white/50 uppercase">
                                    {t('tagline')}
                                </span>
                                <div className="text-[10px] font-mono tracking-widest text-white">
                                    {t('email')}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── MAIN NAVBAR ───────────────────────────────────────── */}
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-center justify-between h-16 md:h-20 relative">

                        {/* LEFT NAV */}
                        <div className="hidden md:flex items-center gap-1 flex-1">
                            <NavigationMenu>
                                <NavigationMenuList className="gap-0">

                                    {/* Accueil */}
                                    <NavigationMenuItem>
                                        <Link
                                            href="/"
                                            className="group inline-flex h-9 items-center px-4 text-xs font-light tracking-[0.15em] uppercase text-[#1B2D5B]/60 hover:text-[#B8962E] transition-colors duration-300 relative"
                                        >
                                            {t('home')}
                                            <span className="absolute bottom-1 left-4 right-4 h-px bg-[#B8962E] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                                        </Link>
                                    </NavigationMenuItem>

                                    {/* Destinations dropdown */}
                                    <NavigationMenuItem>
                                        <NavigationMenuTrigger className="h-9 px-4 text-xs font-light tracking-[0.15em] uppercase text-[#1B2D5B]/60 hover:text-[#B8962E] bg-transparent hover:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent data-[state=open]:text-[#B8962E] transition-colors duration-300">
                                            {t('destinations')}
                                        </NavigationMenuTrigger>
                                        <NavigationMenuContent>
                                            <div className="w-[520px] bg-white border border-[#1B2D5B]/10 shadow-2xl p-0 overflow-hidden">
                                                <div className="px-6 py-4 border-b border-[#1B2D5B]/10 bg-[#1B2D5B]/[0.03]">
                                                    <p className="text-[10px] font-mono tracking-[0.35em] text-[#B8962E] uppercase">
                                                        {t('top_destinations')}
                                                    </p>
                                                </div>
                                                <div className="grid grid-cols-2 gap-px bg-[#1B2D5B]/[0.04] p-px">
                                                    {DESTINATIONS.map((dest) => (
                                                        <Link
                                                            key={dest.slug}
                                                            href={`/destinations/${dest.slug}`}
                                                            className="group flex items-start gap-3 p-5 bg-white hover:bg-[#1B2D5B]/[0.03] transition-colors duration-200"
                                                        >
                                                            <div className="mt-0.5 w-7 h-7 rounded-full bg-[#B8962E]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#B8962E]/20 transition-colors duration-200">
                                                                <dest.icon className="h-3.5 w-3.5 text-[#B8962E]" />
                                                            </div>
                                                            <div>
                                                                <div className="text-[#1B2D5B] text-sm font-light">
                                                                    {dest.name}
                                                                </div>
                                                                <div className="text-[#1B2D5B]/40 text-[10px] font-mono tracking-wide mt-0.5">
                                                                    {dest.region}
                                                                </div>
                                                                <div className="text-[#B8962E]/70 text-[9px] font-mono tracking-wider mt-1 uppercase">
                                                                    {dest.days}
                                                                </div>
                                                            </div>
                                                            <ChevronRight className="ml-auto h-3 w-3 text-[#1B2D5B]/15 group-hover:text-[#B8962E]/60 group-hover:translate-x-0.5 transition-all duration-200 mt-1" />
                                                        </Link>
                                                    ))}
                                                </div>
                                                <div className="px-6 py-3 bg-[#1B2D5B]/[0.03] border-t border-[#1B2D5B]/10">
                                                    <Link
                                                        href="/destinations"
                                                        className="flex items-center gap-2 text-[#B8962E] text-[10px] font-mono tracking-widest uppercase hover:text-[#1B2D5B] transition-colors duration-200 group"
                                                    >
                                                        {t('all_destinations')}
                                                        <ChevronRight className="h-3 w-3 group-hover:translate-x-1 transition-transform duration-200" />
                                                    </Link>
                                                </div>
                                            </div>
                                        </NavigationMenuContent>
                                    </NavigationMenuItem>

                                    {/* Circuits */}
                                    <NavigationMenuItem>
                                        <Link
                                            href="/circuits"
                                            className="group inline-flex h-9 items-center px-4 text-xs font-light tracking-[0.15em] uppercase text-[#1B2D5B]/60 hover:text-[#B8962E] transition-colors duration-300 relative"
                                        >
                                            {t('circuits')}
                                            <span className="absolute bottom-1 left-4 right-4 h-px bg-[#B8962E] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                                        </Link>
                                    </NavigationMenuItem>

                                </NavigationMenuList>
                            </NavigationMenu>
                        </div>

                        {/* CENTER LOGO */}
                        <div className="absolute left-1/2 -translate-x-1/2">
                            <Link href="/" className="block group">
                                <motion.div
                                    whileHover={{ scale: 1.03 }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                >
                                    <Image
                                        src="/explorea_logo_dark.png"
                                        alt="Explorea — Explorez sans limites"
                                        width={70}
                                        height={35}
                                        className="object-contain h-auto"
                                        priority
                                    />
                                </motion.div>
                            </Link>
                        </div>

                        {/* RIGHT SIDE */}
                        <div className="hidden md:flex items-center gap-3 flex-1 justify-end">
                            <Link
                                href="/contact"
                                className="group text-xs font-light tracking-[0.15em] uppercase text-[#1B2D5B]/60 hover:text-[#B8962E] transition-colors duration-300 relative px-4 py-2"
                            >
                                {t('contact')}
                                <span className="absolute bottom-0 left-4 right-4 h-px bg-[#B8962E] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                            </Link>

                            <LanguageSwitcher />

                            {isSignedIn ? (
                                <div className="flex items-center gap-3">
                                    <Link
                                        href="/mon-compte"
                                        className="text-xs font-mono tracking-widest text-[#1B2D5B]/50 hover:text-[#B8962E] uppercase transition-colors duration-300"
                                    >
                                        {t('account')}
                                    </Link>
                                    <UserButton afterSignOutUrl="/" />
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Link
                                        href="/connexion"
                                        className="inline-flex items-center h-9 px-4 text-xs tracking-widest font-light rounded-none text-[#1B2D5B]/60 hover:text-[#1B2D5B] hover:bg-[#1B2D5B]/5 transition-colors duration-200"
                                    >
                                        {t('login')}
                                    </Link>
                                    <Link
                                        href="/inscription"
                                        className="inline-flex items-center h-9 px-5 text-xs tracking-widest font-light rounded-none bg-[#B8962E] hover:bg-[#D4AF5A] text-white transition-all duration-300 shadow-[0_0_20px_rgba(184,150,46,0.2)] hover:shadow-[0_0_30px_rgba(184,150,46,0.35)]"
                                    >
                                        {t('register')}
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* MOBILE RIGHT */}
                        <div className="flex md:hidden items-center gap-2 ml-auto">
                            <LanguageSwitcher />
                            <button
                                onClick={() => setMobileOpen(true)}
                                className="p-2 text-[#1B2D5B]/60 hover:text-[#1B2D5B] transition-colors"
                            >
                                <Menu className="h-5 w-5" />
                            </button>
                        </div>

                    </div>
                </div>

                {/* Gold bottom line on scroll */}
                <AnimatePresence>
                    {scrolled && (
                        <motion.div
                            initial={{ scaleX: 0, opacity: 0 }}
                            animate={{ scaleX: 1, opacity: 1 }}
                            exit={{ scaleX: 0, opacity: 0 }}
                            className="h-px bg-gradient-to-r from-transparent via-[#B8962E]/40 to-transparent origin-center"
                        />
                    )}
                </AnimatePresence>
            </motion.header>

            {/* ── MOBILE DRAWER ─────────────────────────────────────────── */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileOpen(false)}
                            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                        />

                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', stiffness: 300, damping: 35 }}
                            className="fixed top-0 right-0 bottom-0 z-50 w-80 bg-white border-l border-[#1B2D5B]/10 flex flex-col overflow-y-auto"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-5 border-b border-[#1B2D5B]/10">
                                <Image
                                    src="/explorea_logo_dark.png"
                                    alt="Explorea"
                                    width={90}
                                    height={60}
                                    className="object-contain"
                                />
                                <button
                                    onClick={() => setMobileOpen(false)}
                                    className="p-2 text-[#1B2D5B]/40 hover:text-[#1B2D5B] transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Nav links */}
                            <nav className="flex-1 px-4 py-6">
                                <div className="space-y-1">
                                    {[
                                        { href: '/', label: t('home') },
                                        { href: '/destinations', label: t('destinations') },
                                        { href: '/circuits', label: t('circuits') },
                                        { href: '/contact', label: t('contact') },
                                    ].map((link, i) => (
                                        <motion.div
                                            key={link.href}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.07 }}
                                        >
                                            <Link
                                                href={link.href}
                                                onClick={() => setMobileOpen(false)}
                                                className="flex items-center justify-between px-4 py-3.5 text-sm font-light tracking-[0.1em] uppercase text-[#1B2D5B]/60 hover:text-[#1B2D5B] hover:bg-[#1B2D5B]/[0.04] transition-all duration-200 group rounded-sm"
                                            >
                                                {link.label}
                                                <ChevronRight className="h-3 w-3 text-[#1B2D5B]/20 group-hover:text-[#B8962E] group-hover:translate-x-0.5 transition-all duration-200" />
                                            </Link>
                                        </motion.div>
                                    ))}
                                </div>

                                <div className="my-6 h-px bg-[#1B2D5B]/10" />

                                <div className="px-4 mb-4">
                                    <p className="text-[9px] font-mono tracking-[0.4em] uppercase text-[#B8962E] mb-3">
                                        {t('top_destinations')}
                                    </p>
                                    <div className="space-y-2">
                                        {DESTINATIONS.map((dest, i) => (
                                            <motion.div
                                                key={dest.slug}
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.3 + i * 0.06 }}
                                            >
                                                <Link
                                                    href={`/destinations/${dest.slug}`}
                                                    onClick={() => setMobileOpen(false)}
                                                    className="flex items-center gap-3 py-2 text-[#1B2D5B]/40 hover:text-[#1B2D5B] transition-colors duration-200 group"
                                                >
                                                    <dest.icon className="h-3.5 w-3.5 text-[#B8962E]/50 group-hover:text-[#B8962E]" />
                                                    <span className="text-xs font-light">{dest.name}</span>
                                                </Link>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </nav>

                            {/* Footer */}
                            <div className="px-6 py-6 border-t border-[#1B2D5B]/10 space-y-3">
                                {isSignedIn ? (
                                    <div className="flex items-center gap-3">
                                        <UserButton afterSignOutUrl="/" />
                                        <span className="text-xs text-[#1B2D5B]/40 font-mono">
                                            {t('account')}
                                        </span>
                                    </div>
                                ) : (
                                    <>
                                        <Link
                                            href="/connexion"
                                            onClick={() => setMobileOpen(false)}
                                            className="flex items-center justify-center w-full h-10 rounded-none border border-[#1B2D5B]/20 text-[#1B2D5B]/60 hover:text-[#1B2D5B] hover:bg-[#1B2D5B]/5 text-xs tracking-widest transition-colors duration-200"
                                        >
                                            {t('login')}
                                        </Link>
                                        <Link
                                            href="/inscription"
                                            onClick={() => setMobileOpen(false)}
                                            className="flex items-center justify-center w-full h-10 rounded-none bg-[#B8962E] hover:bg-[#D4AF5A] text-white text-xs tracking-widest transition-all duration-300"
                                        >
                                            {t('book_now')}
                                        </Link>
                                    </>
                                )}

                                <div className="pt-2 flex items-center justify-between">
                                    <p className="text-[10px] font-mono text-[#1B2D5B]/30 tracking-widest">
                                        {t('phone')}
                                    </p>
                                    <LanguageSwitcher />
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    )
}
