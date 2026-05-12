// components/ItineraryMap.tsx
'use client'

import { useEffect, useRef, useState } from 'react'

type ItineraryDay = {
    day: number
    title: string
    location: string
    lat: number
    lng: number
    overnight: string
    description: string
    activities: string[]
    meals: string[]
    icon: string
}

interface Props {
    itinerary: ItineraryDay[]
    activeDay: number
    onDaySelect: (day: number) => void
}

export default function ItineraryMap({ itinerary, activeDay, onDaySelect }: Props) {
    const mapRef = useRef<HTMLDivElement>(null)
    const mapInstanceRef = useRef<any>(null)
    const markersRef = useRef<any[]>([])
    const [loaded, setLoaded] = useState(false)

    // ── Build marker HTML ─────────────────────────────────────────────────
    function buildMarkerHtml(day: ItineraryDay, isActive: boolean) {
        return `
            <div style="position:relative;">
                <div style="
                    width:44px;height:44px;
                    background:${isActive ? '#1B2D5B' : '#0E1826'};
                    border:2px solid ${isActive ? '#B8962E' : 'rgba(184,150,46,0.4)'};
                    border-radius:50%;
                    display:flex;align-items:center;justify-content:center;
                    font-size:18px;cursor:pointer;
                    box-shadow:0 0 ${isActive ? '20px' : '8px'} rgba(184,150,46,${isActive ? '0.5' : '0.2'});
                    transform:${isActive ? 'scale(1.25)' : 'scale(1)'};
                    transition:all 0.3s;
                ">${day.icon}</div>
                <div style="
                    position:absolute;top:48px;left:50%;transform:translateX(-50%);
                    white-space:nowrap;
                    background:rgba(14,24,38,0.92);
                    color:${isActive ? '#B8962E' : 'rgba(255,255,255,0.5)'};
                    font-size:9px;font-family:monospace;letter-spacing:0.1em;
                    padding:2px 6px;
                    border:1px solid rgba(184,150,46,${isActive ? '0.5' : '0.15'});
                    pointer-events:none;
                ">J${day.day} · ${day.location}</div>
            </div>
        `
    }

    // ── Initialize map ────────────────────────────────────────────────────
    useEffect(() => {
        let cancelled = false

        const initMap = async () => {
            if (!mapRef.current) return

            const L = (await import('leaflet')).default
            await import('leaflet/dist/leaflet.css')

            if (cancelled) return

            // ✅ Destroy any existing Leaflet instance on this container
            const container = mapRef.current as any
            if (container._leaflet_id) {
                try {
                    // Find and remove the existing map
                    const existingMap = (L as any).DomEvent._fns
                    container._leaflet_id = null
                } catch {}
            }

            // ✅ Nuclear option — remove all leaflet classes and re-use the div
            mapRef.current.innerHTML = ''
            mapRef.current.removeAttribute('data-leaflet-id')

            // Clean up old instance if exists
            if (mapInstanceRef.current) {
                try { mapInstanceRef.current.remove() } catch {}
                mapInstanceRef.current = null
                markersRef.current = []
            }

            // Fix default icons
            delete (L.Icon.Default.prototype as any)._getIconUrl
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
                iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
            })

            const avgLat = itinerary.reduce((s, d) => s + d.lat, 0) / itinerary.length
            const avgLng = itinerary.reduce((s, d) => s + d.lng, 0) / itinerary.length

            const map = L.map(mapRef.current, {
                center: [avgLat, avgLng],
                zoom: 5,
                zoomControl: false,
                scrollWheelZoom: false,
            })

            if (cancelled) {
                map.remove()
                return
            }

            // Dark tile layer
            L.tileLayer(
                'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
                { attribution: '© OpenStreetMap © CARTO', subdomains: 'abcd', maxZoom: 19 }
            ).addTo(map)

            // Custom zoom
            L.control.zoom({ position: 'topright' }).addTo(map)

            const coords = itinerary.map(d => [d.lat, d.lng] as [number, number])

            // Route shadow
            L.polyline(coords, { color: '#B8962E', weight: 6, opacity: 0.08, smoothFactor: 2 }).addTo(map)
            // Route line
            L.polyline(coords, { color: '#B8962E', weight: 2, opacity: 0.7, dashArray: '8, 12', smoothFactor: 2 }).addTo(map)

            // Markers
            itinerary.forEach((day) => {
                const isActive = day.day === activeDay

                const icon = L.divIcon({
                    html: buildMarkerHtml(day, isActive),
                    className: '',
                    iconSize: [44, 60],
                    iconAnchor: [22, 22],
                    popupAnchor: [0, -28],
                })

                const marker = L.marker([day.lat, day.lng], { icon })
                    .addTo(map)
                    .bindPopup(`
                        <div style="font-family:system-ui,sans-serif;min-width:220px;background:#0E1826;color:#EDE8DF;padding:0;">
                            <div style="background:#1B2D5B;padding:10px 14px;border-bottom:1px solid rgba(184,150,46,0.2);">
                                <div style="font-size:9px;letter-spacing:0.3em;color:#B8962E;text-transform:uppercase;margin-bottom:4px;font-family:monospace;">Jour ${day.day}</div>
                                <div style="font-size:15px;font-weight:300;color:white;">${day.title}</div>
                            </div>
                            <div style="padding:12px 14px;">
                                <p style="font-size:12px;color:rgba(237,232,223,0.6);line-height:1.6;margin:0 0 10px;font-weight:300;">${day.description.substring(0, 110)}…</p>
                                <div style="font-size:10px;color:rgba(184,150,46,0.7);font-family:monospace;">🏨 ${day.overnight}</div>
                            </div>
                        </div>
                    `, { className: 'custom-popup', maxWidth: 280 })

                marker.on('click', () => onDaySelect(day.day))
                markersRef.current.push(marker)
            })

            const bounds = L.latLngBounds(coords)
            map.fitBounds(bounds, { padding: [60, 60] })

            mapInstanceRef.current = map
            setLoaded(true)
        }

        initMap()

        return () => {
            cancelled = true
            if (mapInstanceRef.current) {
                try { mapInstanceRef.current.remove() } catch {}
                mapInstanceRef.current = null
                markersRef.current = []
                setLoaded(false)
            }
        }
    }, []) // ← empty deps: only run once

    // ── Update markers when activeDay changes ─────────────────────────────
    useEffect(() => {
        if (!mapInstanceRef.current || !loaded) return

        const updateMarkers = async () => {
            const L = (await import('leaflet')).default

            markersRef.current.forEach((marker, i) => {
                const day = itinerary[i]
                if (!day) return
                const isActive = day.day === activeDay

                marker.setIcon(L.divIcon({
                    html: buildMarkerHtml(day, isActive),
                    className: '',
                    iconSize: [44, 60],
                    iconAnchor: [22, 22],
                    popupAnchor: [0, -28],
                }))

                if (isActive) {
                    mapInstanceRef.current.setView([day.lat, day.lng], 7, {
                        animate: true,
                        duration: 0.8,
                    })
                }
            })
        }

        updateMarkers()
    }, [activeDay, loaded])

    return (
        <div className="relative">
            {/* Map */}
            <div
                ref={mapRef}
                style={{ height: '480px', width: '100%', background: '#0E1826', position: 'relative' }}
            />

            {/* Day selector strip */}
            <div className="bg-[#0E1826] border-t border-[#B8962E]/10 p-3 flex gap-2 overflow-x-auto">
                {itinerary.map(day => (
                    <button
                        key={day.day}
                        onClick={() => onDaySelect(day.day)}
                        className={`flex-shrink-0 flex flex-col items-center gap-1 px-4 py-2.5 transition-all duration-200 border ${
                            activeDay === day.day
                                ? 'bg-[#1B2D5B] border-[#B8962E]/50 text-[#B8962E]'
                                : 'border-white/[0.06] text-white/30 hover:border-[#B8962E]/20 hover:text-white/60'
                        }`}
                    >
                        <span className="text-base leading-none">{day.icon}</span>
                        <span className="text-[9px] font-mono tracking-wider">J{day.day}</span>
                        <span className="text-[8px] font-mono opacity-60 max-w-[60px] truncate text-center leading-none">{day.location}</span>
                    </button>
                ))}
            </div>

            {/* Popup & map styles */}
            <style>{`
                .custom-popup .leaflet-popup-content-wrapper {
                    background: #0E1826 !important;
                    border: 1px solid rgba(184,150,46,0.3) !important;
                    border-radius: 0 !important;
                    padding: 0 !important;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.6) !important;
                }
                .custom-popup .leaflet-popup-tip {
                    background: #1B2D5B !important;
                }
                .custom-popup .leaflet-popup-content {
                    margin: 0 !important;
                    width: auto !important;
                }
                .leaflet-container {
                    background: #0E1826 !important;
                    font-family: system-ui, sans-serif !important;
                }
                .leaflet-control-zoom a {
                    background: #0E1826 !important;
                    color: rgba(184,150,46,0.8) !important;
                    border-color: rgba(184,150,46,0.2) !important;
                }
                .leaflet-control-zoom a:hover {
                    background: #1B2D5B !important;
                    color: #B8962E !important;
                }
                .leaflet-control-attribution {
                    background: rgba(14,24,38,0.8) !important;
                    color: rgba(255,255,255,0.2) !important;
                    font-size: 8px !important;
                }
            `}</style>
        </div>
    )
}
