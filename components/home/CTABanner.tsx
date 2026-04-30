// components/home/CTABanner.tsx
'use client'

import { useRef } from 'react'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Link } from '@/lib/navigation'

const EASE = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number]

export default function CTABanner() {
    const ref = useRef<HTMLDivElement>(null)
    const inView = useInView(ref, { once: true, margin: '-60px' })
    const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
    const bgY = useTransform(scrollYProgress, [0, 1], ['-10%', '10%'])

    return (
        <section ref={ref} className="relative py-32 overflow-hidden">
            <motion.div className="absolute inset-0 z-0" style={{ y: bgY }}>
                <div className="absolute inset-0 bg-gradient-to-r from-amber-950/80 via-orange-950/60 to-amber-900/80" />
            </motion.div>
            <motion.div
                className="relative z-10 max-w-4xl mx-auto px-6 text-center"
                initial={{ opacity: 0, y: 50 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.9, ease: EASE }}
            >
                <div className="flex items-center justify-center gap-3 mb-6">
                    <div className="h-px w-10 bg-amber-400/50" />
                    <span className="text-amber-400/70 text-xs tracking-[0.4em] uppercase font-mono">Votre aventure commence ici</span>
                    <div className="h-px w-10 bg-amber-400/50" />
                </div>
                <h2 className="text-4xl md:text-6xl font-light text-white mb-6 leading-tight" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                    Prêt pour votre<br /><em className="text-amber-300">odyssée saharienne ?</em>
                </h2>
                <p className="text-white/50 text-base mb-10 max-w-lg mx-auto leading-relaxed">
                    Nos experts créent votre voyage sur mesure. Contactez-nous et partez dans 48h.
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                    <Link
                        href="/contact"
                        className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-medium rounded-none tracking-wide px-10 h-12 text-sm transition-all duration-300"
                    >
                        Planifier mon voyage <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                        href="/circuits"
                        className="inline-flex items-center h-12 px-8 border border-white/20 text-white hover:bg-white/10 rounded-none tracking-widest text-xs transition-all duration-300"
                    >
                        Voir les circuits
                    </Link>
                </div>
            </motion.div>
        </section>
    )
}
