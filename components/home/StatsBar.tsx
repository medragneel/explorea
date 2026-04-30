// components/home/StatsBar.tsx
'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { MapPin, Users, Clock, Star } from 'lucide-react'

const EASE = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number]
const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.7, delay: i * 0.12, ease: EASE } }),
}
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }

const STATS = [
    { value: '48+', label: 'Destinations', icon: MapPin },
    { value: '12K', label: 'Voyageurs', icon: Users },
    { value: '18', label: 'Années', icon: Clock },
    { value: '4.9', label: 'Note moyenne', icon: Star },
]

export default function StatsBar() {
    const ref = useRef(null)
    const inView = useInView(ref, { once: true, margin: '-80px' })

    return (
        <motion.div
            ref={ref}
            variants={stagger}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            className="border-y border-white/[0.06] bg-[#0D0A07]"
        >
            <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-white/[0.06]">
                {STATS.map((stat, i) => (
                    <motion.div key={stat.label} variants={fadeUp} custom={i} className="flex flex-col items-center gap-1 px-6 py-4">
                        <stat.icon className="h-4 w-4 text-amber-500/60 mb-2" />
                        <span className="text-4xl md:text-5xl font-light text-amber-300" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                            {stat.value}
                        </span>
                        <span className="text-[10px] tracking-[0.25em] uppercase text-white/30 font-mono">{stat.label}</span>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    )
}
