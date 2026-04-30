// components/home/HeroSection.tsx
'use client'

import { useRef, useState, useEffect } from 'react'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Play, Pause, Volume2, VolumeX, ChevronDown, ArrowRight } from 'lucide-react'
import { Link } from '@/lib/navigation'

const EASE = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number]

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }
const fadeUp = {
    hidden: { opacity: 0, y: 60 },
    visible: (i = 0) => ({
        opacity: 1, y: 0,
        transition: { duration: 0.8, delay: i * 0.12, ease: EASE },
    }),
}

export default function HeroSection() {
    const heroRef = useRef<HTMLDivElement>(null)
    const videoRef = useRef<HTMLVideoElement>(null)
    const [playing, setPlaying] = useState(true)
    const [muted, setMuted] = useState(true)
    const [videoProgress, setVideoProgress] = useState(0)

    const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
    const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 })

    const videoY = useTransform(smoothProgress, [0, 1], ['0%', '30%'])
    const videoScale = useTransform(smoothProgress, [0, 1], [1, 1.12])
    const textY = useTransform(smoothProgress, [0, 1], ['0%', '60%'])
    const overlayOpacity = useTransform(smoothProgress, [0, 0.5], [0.55, 0.85])
    const heroOpacity = useTransform(smoothProgress, [0, 0.8], [1, 0])

    function togglePlay() {
        if (!videoRef.current) return
        if (playing) { videoRef.current.pause(); setPlaying(false) }
        else { videoRef.current.play(); setPlaying(true) }
    }

    function toggleMute() {
        if (!videoRef.current) return
        videoRef.current.muted = !muted
        setMuted(!muted)
    }

    useEffect(() => {
        const v = videoRef.current
        if (!v) return
        const update = () => setVideoProgress((v.currentTime / v.duration) * 100 || 0)
        v.addEventListener('timeupdate', update)
        return () => v.removeEventListener('timeupdate', update)
    }, [])

    function seekVideo(e: React.MouseEvent<HTMLDivElement>) {
        const v = videoRef.current
        if (!v) return
        const rect = e.currentTarget.getBoundingClientRect()
        v.currentTime = ((e.clientX - rect.left) / rect.width) * v.duration
    }

    return (
        <section ref={heroRef} className="relative h-screen overflow-hidden">
            {/* Video */}
            <motion.div className="absolute inset-0 z-0" style={{ y: videoY, scale: videoScale }}>
                <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    src="https://videos.pexels.com/video-files/3571264/3571264-uhd_2560_1440_30fps.mp4"
                    autoPlay muted loop playsInline
                />
            </motion.div>

            {/* Overlay */}
            <motion.div
                className="absolute inset-0 z-10 bg-gradient-to-t from-[#080604] via-[#080604]/40 to-[#080604]/20"
                style={{ opacity: overlayOpacity }}
            />

            {/* Grain */}
            <div
                className="absolute inset-0 z-10 opacity-[0.03] pointer-events-none"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'repeat', backgroundSize: '128px 128px',
                }}
            />

            {/* Hero text */}
            <motion.div
                className="absolute inset-0 z-20 flex flex-col justify-end pb-32 px-8 md:px-16 lg:px-24"
                style={{ y: textY, opacity: heroOpacity }}
            >
                <motion.div initial="hidden" animate="visible" variants={stagger}>
                    <motion.div variants={fadeUp} className="flex items-center gap-3 mb-6">
                        <div className="h-px w-12 bg-amber-400" />
                        <span className="text-amber-400 text-xs tracking-[0.4em] uppercase font-mono">
                            Agence de Voyage Premium · Algérie
                        </span>
                    </motion.div>

                    <motion.h1
                        variants={fadeUp} custom={1}
                        className="text-5xl md:text-7xl lg:text-8xl font-light leading-[0.9] tracking-tight mb-6"
                        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                    >
                        L'Algérie<br />
                        <em className="text-amber-300 not-italic">Intemporelle</em>
                    </motion.h1>

                    <motion.p
                        variants={fadeUp} custom={2}
                        className="text-[#EDE8DF]/60 text-base md:text-lg font-light tracking-wide max-w-lg mb-10 leading-relaxed"
                    >
                        Du Sahara mystique aux côtes méditerranéennes — des voyages d'exception façonnés pour les âmes aventurières.
                    </motion.p>

                    <motion.div variants={fadeUp} custom={3} className="flex flex-wrap gap-4 items-center">
                        <Link
                            href="/circuits"
                            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-medium tracking-wide px-8 h-12 rounded-none transition-all duration-300 text-sm"
                        >
                            Découvrir nos circuits
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                        <Link
                            href="/contact"
                            className="inline-flex items-center h-12 px-8 border border-white/20 text-white hover:bg-white/10 font-light tracking-widest text-xs rounded-none transition-all duration-300"
                        >
                            Sur mesure
                        </Link>
                    </motion.div>
                </motion.div>
            </motion.div>

            {/* Video controls */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2, duration: 0.6 }}
                className="absolute bottom-8 left-8 md:left-16 lg:left-24 z-30 flex flex-col gap-3"
            >
                <div className="w-48 h-px bg-white/20 cursor-pointer relative" onClick={seekVideo}>
                    <div className="absolute left-0 top-0 h-full bg-amber-400 transition-all" style={{ width: `${videoProgress}%` }} />
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={togglePlay} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-xs tracking-widest">
                        {playing ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                        <span className="font-mono">{playing ? 'PAUSE' : 'PLAY'}</span>
                    </button>
                    <div className="w-px h-3 bg-white/20" />
                    <button onClick={toggleMute} className="text-white/60 hover:text-white transition-colors">
                        {muted ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                    </button>
                </div>
            </motion.div>

            {/* Scroll hint */}
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }}
                className="absolute bottom-8 right-8 md:right-16 z-30 flex flex-col items-center gap-2"
            >
                <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
                    <ChevronDown className="h-5 w-5 text-white/40" />
                </motion.div>
                <span className="text-white/30 text-[9px] tracking-[0.3em] uppercase font-mono" style={{ writingMode: 'vertical-rl' }}>
                    Scroll
                </span>
            </motion.div>
        </section>
    )
}
