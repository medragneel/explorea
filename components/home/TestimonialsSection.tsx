// components/home/TestimonialsSection.tsx
'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star } from 'lucide-react'

const EASE = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number]
const fadeUp = {
    hidden: { opacity: 0, y: 60 },
    visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.8, delay: i * 0.12, ease: EASE } }),
}
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }

const TESTIMONIALS = [
    { name: 'Sophie Laurent', origin: 'Paris, France', text: "Une expérience qui a changé ma vision du monde. Le Sahara algérien est d'une beauté à couper le souffle.", rating: 5, circuit: 'Grand Erg Oriental' },
    { name: 'Ahmed Benali', origin: 'Montréal, Canada', text: "Retourner aux racines à travers le Tassili... Indescriptible. L'équipe est exceptionnelle.", rating: 5, circuit: "Tassili n'Ajjer" },
    { name: 'Marco Ferretti', origin: 'Milan, Italie', text: "Ghardaïa m'a envoûté. Architecture, culture, hospitalité — tout est parfait.", rating: 5, circuit: 'Route des Ksour' },
]

export default function TestimonialsSection() {
    const ref = useRef(null)
    const inView = useInView(ref, { once: true, margin: '-80px' })

    return (
        <section className="py-28 bg-[#0D0A07] px-6 md:px-12 lg:px-20">
            <div className="max-w-7xl mx-auto">
                <motion.div ref={ref} variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'}>
                    <motion.div variants={fadeUp} className="flex items-center gap-3 mb-4">
                        <div className="h-px w-10 bg-amber-500" />
                        <span className="text-amber-500 text-xs tracking-[0.3em] uppercase font-light font-mono">Témoignages</span>
                    </motion.div>
                    <motion.h2 variants={fadeUp} custom={1} className="text-4xl md:text-5xl font-light mb-16" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                        Ce qu'ils disent<br /><em className="text-amber-300">de leurs voyages</em>
                    </motion.h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {TESTIMONIALS.map((t, i) => (
                            <motion.div key={t.name} variants={fadeUp} custom={i}>
                                <Card className="bg-[#100D08] border-white/[0.06] rounded-none overflow-hidden group hover:border-amber-500/20 transition-colors duration-300">
                                    <CardContent className="p-8">
                                        <div className="flex gap-0.5 mb-6">
                                            {Array.from({ length: t.rating }).map((_, j) => (
                                                <Star key={j} className="h-3 w-3 fill-amber-400 text-amber-400" />
                                            ))}
                                        </div>
                                        <blockquote className="text-white/70 text-base leading-relaxed mb-8 italic" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                                            "{t.text}"
                                        </blockquote>
                                        <div className="flex items-center justify-between border-t border-white/[0.06] pt-6">
                                            <div>
                                                <div className="text-white text-sm font-medium">{t.name}</div>
                                                <div className="text-white/30 text-xs font-mono tracking-wide">{t.origin}</div>
                                            </div>
                                            <Badge className="bg-amber-500/10 text-amber-400/80 border-amber-500/20 rounded-none text-[9px] font-mono tracking-wider">
                                                {t.circuit}
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
