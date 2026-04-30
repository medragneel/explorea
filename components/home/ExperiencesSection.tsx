// components/home/ExperiencesSection.tsx
'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Compass, Tent, Camera, Globe } from 'lucide-react'

const EASE = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number]
const fadeUp = {
    hidden: { opacity: 0, y: 60 },
    visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.8, delay: i * 0.12, ease: EASE } }),
}
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }

const EXPERIENCES = [
    { icon: Compass, title: 'Méharées', desc: "Traversées à dos de dromadaire sur d'anciens itinéraires caravaniers." },
    { icon: Tent, title: 'Bivouacs', desc: 'Nuits sous les étoiles avec campements de luxe en plein désert.' },
    { icon: Camera, title: 'Photographie', desc: 'Circuits dédiés aux photographes dans les plus beaux paysages.' },
    { icon: Globe, title: 'Sur mesure', desc: 'Chaque voyage pensé et façonné selon vos désirs.' },
]

export default function ExperiencesSection() {
    const ref = useRef(null)
    const inView = useInView(ref, { once: true, margin: '-80px' })

    return (
        <section className="py-28 px-6 md:px-12 lg:px-20 max-w-7xl mx-auto">
            <motion.div ref={ref} variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'}>
                <motion.div variants={fadeUp} className="flex items-center gap-3 mb-4">
                    <div className="h-px w-10 bg-amber-500" />
                    <span className="text-amber-500 text-xs tracking-[0.3em] uppercase font-light font-mono">Nos Expériences</span>
                </motion.div>
                <motion.h2 variants={fadeUp} custom={1} className="text-4xl md:text-5xl font-light mb-16 leading-tight" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                    Voyager autrement,<br /><em className="text-amber-300">vivre pleinement</em>
                </motion.h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/[0.04]">
                    {EXPERIENCES.map((exp, i) => (
                        <motion.div
                            key={exp.title}
                            variants={fadeUp}
                            custom={i}
                            whileHover={{ backgroundColor: 'rgba(217,119,6,0.06)' }}
                            className="bg-[#080604] p-10 group cursor-pointer transition-colors duration-300 relative overflow-hidden"
                        >
                            <div className="absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-500" style={{ background: '#D97706' }} />
                            <exp.icon className="h-6 w-6 text-amber-500/60 mb-6 group-hover:text-amber-400 transition-colors duration-300" />
                            <h3 className="text-xl font-light mb-4 text-white" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>{exp.title}</h3>
                            <p className="text-white/40 text-sm leading-relaxed">{exp.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </section>
    )
}
