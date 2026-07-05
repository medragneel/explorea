// components/home/ExperiencesSection.tsx
'use client'

import { useRef } from 'react'
import { useTranslations } from 'next-intl'
import { motion, useInView } from 'framer-motion'
import { Compass, Tent, Camera, Globe } from 'lucide-react'

const EASE = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number]
const fadeUp = {
    hidden: { opacity: 0, y: 60 },
    visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.8, delay: i * 0.12, ease: EASE } }),
}
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }

// Icons are fixed — only text content is translated
const EXPERIENCE_ICONS = [Compass, Tent, Camera, Globe]
const EXPERIENCE_KEYS = ['trekking', 'camping', 'photography', 'custom'] as const

export default function ExperiencesSection() {
    const t = useTranslations('home.experiences')
    const ref = useRef(null)
    const inView = useInView(ref, { once: true, margin: '-80px' })

    return (
        <section className="py-28 px-6 md:px-12 lg:px-20 max-w-7xl mx-auto">
            <motion.div ref={ref} variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'}>

                {/* Eyebrow */}
                <motion.div variants={fadeUp} className="flex items-center gap-3 mb-4">
                    <div className="h-px w-10 bg-amber-500" />
                    <span className="text-amber-500 text-xs tracking-[0.3em] uppercase font-light font-mono">
                        {t('eyebrow')}
                    </span>
                </motion.div>

                {/* Heading */}
                <motion.h2
                    variants={fadeUp}
                    custom={1}
                    className="text-4xl md:text-5xl font-light mb-16 leading-tight"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                    {t('title_line1')}<br />
                    <em className="text-amber-300">{t('title_em')}</em>
                </motion.h2>

                {/* Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/[0.04]">
                    {EXPERIENCE_KEYS.map((key, i) => {
                        const Icon = EXPERIENCE_ICONS[i]
                        return (
                            <motion.div
                                key={key}
                                variants={fadeUp}
                                custom={i}
                                whileHover={{ backgroundColor: 'rgba(217,119,6,0.06)' }}
                                className="bg-[#080604] p-10 group cursor-pointer transition-colors duration-300 relative overflow-hidden"
                            >
                                <div className="absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-500"
                                    style={{ background: '#D97706' }} />
                                <Icon className="h-6 w-6 text-amber-500/60 mb-6 group-hover:text-amber-400 transition-colors duration-300" />
                                <h3
                                    className="text-xl font-light mb-4 text-white"
                                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                                >
                                    {t(`items.${key}.title`)}
                                </h3>
                                <p className="text-white/40 text-sm leading-relaxed">
                                    {t(`items.${key}.desc`)}
                                </p>
                            </motion.div>
                        )
                    })}
                </div>

            </motion.div>
        </section>
    )
}
