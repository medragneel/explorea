'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useTranslations, useLocale } from 'next-intl'
import { useUser, UserButton } from '@clerk/nextjs'
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion'
import {
    Menu, Phone, ChevronRight, ChevronLeft, X, Compass,
} from 'lucide-react'
import { Link } from '@/lib/navigation'
import LanguageSwitcher from './LanguageSwitcher'
import type { Circuit } from '@/db/schema'

// ── RTL-aware chevron ──────────────────────────────────────────────────────

function NavChevron({ isRTL }: { isRTL: boolean }) {
    return isRTL
        ? <ChevronLeft className="h-3 w-3 flex-shrink-0" />
        : <ChevronRight className="h-3 w-3 flex-shrink-0" />
}

// ─────────────────────────────────────────────────────────────────────────

export default function Navbar({ destinations = [] }: { destinations?: Circuit[] }) {
    const t      = useTranslations('nav')
    const locale = useLocale()
    const isRTL  = locale === 'ar'
    const { isSignedIn } = useUser()
    const [scrolled, setScrolled]     = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)
    const { scrollY } = useScroll()

    useMotionValueEvent(scrollY, 'change', (latest) => setScrolled(latest > 40))

    // Underline animation — origin depends on RTL
    const underlineCls = `absolute bottom-1 h-px bg-[#B8962E] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ${
        isRTL ? 'right-4 left-4 origin-right' : 'left-4 right-4 origin-left'
    }`

    // Mobile drawer — slides from correct side
    const drawerVariants = {
        hidden:  { x: isRTL ? '-100%' : '100%' },
        visible: { x: 0 },
        exit:    { x: isRTL ? '-100%' : '100%' },
    }

    const NAV_LINKS = [
        { href: '/',            label: t('home') },
        { href: '/destinations', label: t('destinations') },
        { href: '/circuits',    label: t('circuits') },
        { href: '/contact',     label: t('contact') },
    ]

    return (
        <>
            <motion.header
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
                    scrolled
                        ? 'bg-white shadow-[0_2px_20px_rgba(0,0,0,0.08)]'
                        : 'bg-white border-b border-[#B8962E]/15'
                }`}
            >
                {/* ── TOP MICRO-BAR — desktop only ──────────────────── */}
                <AnimatePresence>
                    {!scrolled && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="hidden md:block overflow-hidden bg-[#1B2D5B]"
                        >
                            <div className="max-w-7xl mx-auto px-6 py-1.5 flex items-center justify-between">
                                <div className="flex items-center gap-1.5 text-white">
                                    <Phone className="h-3 w-3" />
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

                {/* ── MAIN NAVBAR ───────────────────────────────────── */}
                <div className="max-w-7xl mx-auto px-4 md:px-6">
                    <div className="flex items-center h-16 md:h-20 relative">

                        {/* Mobile — Language LEFT (RTL: right) */}
                        <div className={`flex md:hidden ${isRTL ? 'order-last' : 'order-first'}`}>
                            <LanguageSwitcher />
                        </div>

                        {/* Desktop — Left nav */}
                        <div className={`hidden md:flex items-center flex-1 ${isRTL ? 'justify-end' : 'justify-start'}`}>
                            <nav className="flex items-center gap-0">
                                {NAV_LINKS.map(link => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className="group inline-flex h-9 items-center px-4 text-xs font-light tracking-[0.15em] uppercase text-[#1B2D5B]/60 hover:text-[#B8962E] transition-colors duration-300 relative"
                                    >
                                        {link.label}
                                        <span className={underlineCls} />
                                    </Link>
                                ))}
                            </nav>
                        </div>

                        {/* CENTER LOGO — always centered */}
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

                        {/* Desktop — Right side */}
                        <div className={`hidden md:flex items-center gap-3 flex-1 ${isRTL ? 'justify-start' : 'justify-end'}`}>
                            <LanguageSwitcher />

                            {isSignedIn ? (
                                <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                    <Link
                                        href="/mon-compte"
                                        className="text-xs font-mono tracking-widest text-[#1B2D5B]/50 hover:text-[#B8962E] uppercase transition-colors duration-300"
                                    >
                                        {t('account')}
                                    </Link>
                                    <UserButton />
                                </div>
                            ) : (
                                <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                    <Link
                                        href="/connexion"
                                        className="inline-flex items-center h-9 px-4 text-xs tracking-widest font-light rounded-none text-[#1B2D5B]/60 hover:text-[#1B2D5B] hover:bg-[#1B2D5B]/5 transition-colors duration-200"
                                    >
                                        {t('login')}
                                    </Link>
                                    <Link
                                        href="/inscription"
                                        className="inline-flex items-center h-9 px-5 text-xs tracking-widest font-light rounded-none bg-[#B8962E] hover:bg-[#D4AF5A] text-white transition-all duration-300 shadow-[0_0_20px_rgba(184,150,46,0.2)]"
                                    >
                                        {t('register')}
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Mobile — Hamburger RIGHT (RTL: left) */}
                        <div className={`flex md:hidden ${isRTL ? 'order-first' : 'ml-auto'}`}>
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

            {/* ── MOBILE DRAWER ─────────────────────────────────────── */}
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
                            variants={drawerVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            transition={{ type: 'spring', stiffness: 300, damping: 35 }}
                            className={`fixed top-0 bottom-0 z-50 w-80 bg-white flex flex-col overflow-y-auto ${
                                isRTL
                                    ? 'left-0 border-r border-[#1B2D5B]/10'
                                    : 'right-0 border-l border-[#1B2D5B]/10'
                            }`}
                        >
                            {/* Drawer header */}
                            <div className={`flex items-center justify-between px-6 py-5 border-b border-[#1B2D5B]/10 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                <Image
                                    src="/explorea_logo_dark.png"
                                    alt="Explorea"
                                    width={90}
                                    height={60}
                                    className="object-contain h-auto"
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
                                    {NAV_LINKS.map((link, i) => (
                                        <motion.div
                                            key={link.href}
                                            initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.07 }}
                                        >
                                            <Link
                                                href={link.href}
                                                onClick={() => setMobileOpen(false)}
                                                className={`flex items-center justify-between px-4 py-3.5 text-sm font-light tracking-[0.1em] uppercase text-[#1B2D5B]/60 hover:text-[#1B2D5B] hover:bg-[#1B2D5B]/[0.04] transition-all duration-200 group rounded-sm ${isRTL ? 'flex-row-reverse text-right' : ''}`}
                                            >
                                                {link.label}
                                                <NavChevron isRTL={isRTL} />
                                            </Link>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Featured circuits from DB */}
                                {destinations.length > 0 && (
                                    <>
                                        <div className="my-5 h-px bg-[#1B2D5B]/08" />
                                        <div className="px-4">
                                            <p className={`text-[9px] font-mono tracking-[0.4em] uppercase text-[#B8962E] mb-3 ${isRTL ? 'text-right' : ''}`}>
                                                {t('top_destinations')}
                                            </p>
                                            <div className="space-y-1">
                                                {destinations.slice(0, 5).map((dest, i) => (
                                                    <motion.div
                                                        key={dest.id}
                                                        initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: 0.25 + i * 0.05 }}
                                                    >
                                                        <Link
                                                            href={`/circuits/${dest.id}`}
                                                            onClick={() => setMobileOpen(false)}
                                                            className={`flex items-center gap-3 px-2 py-2.5 text-[#1B2D5B]/40 hover:text-[#1B2D5B] hover:bg-[#1B2D5B]/[0.03] transition-colors duration-150 group rounded-sm ${isRTL ? 'flex-row-reverse' : ''}`}
                                                        >
                                                            <Compass className="h-3.5 w-3.5 text-[#B8962E]/50 group-hover:text-[#B8962E] flex-shrink-0" />
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-xs font-light truncate">
                                                                    {dest.nom}
                                                                </p>
                                                                <p className="text-[9px] font-mono text-[#1B2D5B]/25 mt-0.5">
                                                                    {dest.duree} jours
                                                                </p>
                                                            </div>
                                                        </Link>
                                                    </motion.div>
                                                ))}
                                            </div>
                                            <Link
                                                href="/circuits"
                                                onClick={() => setMobileOpen(false)}
                                                className={`flex items-center gap-1.5 mt-3 px-2 text-[10px] font-mono tracking-widest text-[#B8962E] uppercase ${isRTL ? 'flex-row-reverse' : ''}`}
                                            >
                                                <Compass className="h-3 w-3" />
                                                {t('all_destinations')}
                                            </Link>
                                        </div>
                                    </>
                                )}
                            </nav>

                            {/* Drawer footer */}
                            <div className="px-6 py-6 border-t border-[#1B2D5B]/10 space-y-3">
                                {isSignedIn ? (
                                    <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                        <UserButton />
                                        <span className="text-xs text-[#1B2D5B]/40 font-mono">{t('account')}</span>
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
                                <div className={`pt-2 flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                                    <p className="text-[10px] font-mono text-[#1B2D5B]/30 tracking-widest">{t('phone')}</p>
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
