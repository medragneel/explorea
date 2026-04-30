// components/home/ParallaxQuote.tsx
'use client'

import { useRef } from 'react'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'

const EASE = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number]

export default function ParallaxQuote() {
    const ref = useRef<HTMLDivElement>(null)
    const inView = useInView(ref, { once: true, margin: '-100px' })
    const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
    const y = useTransform(scrollYProgress, [0, 1], ['-15%', '15%'])
    const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0])

    return (
        <section ref={ref} className="relative py-40 overflow-hidden">
            <motion.div className="absolute inset-0 z-0" style={{ y }}>
                <div className="absolute inset-0 bg-gradient-to-br from-[#1C1209] via-[#2A1A08] to-[#0D0804]" />
                {[200, 400, 600].map(size => (
                    <div key={size} className="absolute top-1/2 left-1/2 rounded-full border border-amber-500/[0.06]"
                        style={{ width: size, height: size, transform: 'translate(-50%, -50%)' }} />
                ))}
            </motion.div>
            <motion.div className="relative z-10 max-w-4xl mx-auto px-6 text-center" style={{ opacity }}>
                <motion.div initial={{ opacity: 0, y: 40 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 1, ease: EASE }}>
                    <div className="text-9xl text-amber-500/10 leading-none mb-4 select-none" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>"</div>
                    <blockquote className="text-3xl md:text-4xl lg:text-5xl font-light italic text-white/80 leading-relaxed mb-10" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                        Le désert ne se visite pas — il se vit, il se respire, il vous transforme pour toujours.
                    </blockquote>
                    <div className="flex items-center justify-center gap-4">
                        <div className="h-px w-12 bg-amber-500/40" />
                        <cite className="text-amber-500/70 text-xs tracking-[0.4em] uppercase font-mono not-italic">Ibn Battuta · XIVe siècle</cite>
                        <div className="h-px w-12 bg-amber-500/40" />
                    </div>
                </motion.div>
            </motion.div>
        </section>
    )
}
