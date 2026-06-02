// components/ItineraryBuilder.tsx
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
    Plus, Trash2, GripVertical, ChevronDown,
    ChevronUp, MapPin, Bed, Utensils, Activity,
} from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────

export type ItineraryDay = {
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

const MEAL_OPTIONS = ['Petit-déjeuner', 'Déjeuner', 'Dîner']

const ICONS = [
    '✈️', '🏜️', '🐪', '🌴', '🏛️', '🎨', '🗺️',
    '🌅', '🏔️', '🐘', '🔴', '🎋', '🏕️', '🌊',
    '🦁', '❄️', '🏺', '🎭', '🍽️', '🎁',
]

const EMPTY_DAY = (): ItineraryDay => ({
    day: 1,
    title: '',
    location: '',
    lat: 0,
    lng: 0,
    overnight: '',
    description: '',
    activities: [''],
    meals: [],
    icon: '📍',
})

// ─────────────────────────────────────────────────────────────────────────

export default function ItineraryBuilder({
    value,
    onChange,
}: {
    value: ItineraryDay[]
    onChange: (days: ItineraryDay[]) => void
}) {
    const [expandedDay, setExpandedDay] = useState<number | null>(0)

    function addDay() {
        const newDay: ItineraryDay = {
            ...EMPTY_DAY(),
            day: value.length + 1,
        }
        onChange([...value, newDay])
        setExpandedDay(value.length)
    }

    function removeDay(index: number) {
        const updated = value
            .filter((_, i) => i !== index)
            .map((d, i) => ({ ...d, day: i + 1 }))
        onChange(updated)
        setExpandedDay(null)
    }

    function updateDay(index: number, field: keyof ItineraryDay, val: any) {
        const updated = [...value]
        updated[index] = { ...updated[index], [field]: val }
        onChange(updated)
    }

    function addActivity(dayIndex: number) {
        const activities = [...value[dayIndex].activities, '']
        updateDay(dayIndex, 'activities', activities)
    }

    function updateActivity(dayIndex: number, actIndex: number, val: string) {
        const activities = [...value[dayIndex].activities]
        activities[actIndex] = val
        updateDay(dayIndex, 'activities', activities)
    }

    function removeActivity(dayIndex: number, actIndex: number) {
        const activities = value[dayIndex].activities.filter((_, i) => i !== actIndex)
        updateDay(dayIndex, 'activities', activities)
    }

    function toggleMeal(dayIndex: number, meal: string) {
        const meals = value[dayIndex].meals.includes(meal)
            ? value[dayIndex].meals.filter(m => m !== meal)
            : [...value[dayIndex].meals, meal]
        updateDay(dayIndex, 'meals', meals)
    }

    return (
        <div className="space-y-3">

            {/* Header */}
            <div className="flex items-center justify-between">
                <Label className="text-[10px] font-mono tracking-widests text-[#1B2D5B]/50 uppercase">
                    Programme jour par jour
                    <span className="text-[#1B2D5B]/25 normal-case ml-2">
                        ({value.length} jour{value.length !== 1 ? 's' : ''})
                    </span>
                </Label>
                <Button
                    type="button"
                    onClick={addDay}
                    size="sm"
                    className="rounded-none bg-[#1B2D5B] hover:bg-[#B8962E] text-white h-8 px-3 text-[10px] tracking-widests gap-1.5 transition-all"
                >
                    <Plus className="h-3 w-3" />
                    Ajouter un jour
                </Button>
            </div>

            {/* Empty state */}
            {value.length === 0 && (
                <div className="border border-dashed border-[#1B2D5B]/15 p-8 text-center">
                    <p className="text-[#1B2D5B]/30 text-sm font-light mb-3">
                        Aucun jour dans l'itinéraire
                    </p>
                    <Button type="button" onClick={addDay} variant="ghost"
                        className="text-[#B8962E] text-xs tracking-widests gap-1.5">
                        <Plus className="h-3.5 w-3.5" />
                        Ajouter le jour 1
                    </Button>
                </div>
            )}

            {/* Days list */}
            <AnimatePresence>
                {value.map((day, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border border-[#1B2D5B]/10 bg-white overflow-hidden"
                    >
                        {/* Day header — always visible */}
                        <div
                            className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[#1B2D5B]/[0.02] transition-colors"
                            onClick={() => setExpandedDay(expandedDay === i ? null : i)}
                        >
                            {/* Drag handle (visual only) */}
                            <GripVertical className="h-4 w-4 text-[#1B2D5B]/20 flex-shrink-0" />

                            {/* Day number */}
                            <div className="w-8 h-8 bg-[#1B2D5B] flex items-center justify-center flex-shrink-0">
                                <span className="text-[10px] font-mono text-white">{day.day}</span>
                            </div>

                            {/* Icon picker — inline */}
                            <button
                                type="button"
                                onClick={e => { e.stopPropagation() }}
                                className="text-lg flex-shrink-0"
                                title="Cliquez pour changer l'icône"
                            >
                                {day.icon}
                            </button>

                            {/* Title preview */}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-light text-[#1B2D5B] truncate">
                                    {day.title || <span className="text-[#1B2D5B]/30 italic">Titre du jour {day.day}...</span>}
                                </p>
                                {day.location && (
                                    <p className="text-[10px] font-mono text-[#1B2D5B]/30 flex items-center gap-1 mt-0.5">
                                        <MapPin className="h-2.5 w-2.5" />
                                        {day.location}
                                    </p>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1 flex-shrink-0">
                                <button
                                    type="button"
                                    onClick={e => { e.stopPropagation(); removeDay(i) }}
                                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                                {expandedDay === i
                                    ? <ChevronUp className="h-4 w-4 text-[#1B2D5B]/30" />
                                    : <ChevronDown className="h-4 w-4 text-[#1B2D5B]/30" />
                                }
                            </div>
                        </div>

                        {/* Expanded content */}
                        <AnimatePresence>
                            {expandedDay === i && (
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: 'auto' }}
                                    exit={{ height: 0 }}
                                    transition={{ duration: 0.25 }}
                                    className="overflow-hidden"
                                >
                                    <div className="px-4 pb-5 pt-1 space-y-4 border-t border-[#1B2D5B]/06">

                                        {/* Icon selector */}
                                        <div className="space-y-1.5">
                                            <Label className="text-[9px] font-mono tracking-widests text-[#1B2D5B]/40 uppercase">
                                                Icône
                                            </Label>
                                            <div className="flex flex-wrap gap-1.5">
                                                {ICONS.map(icon => (
                                                    <button
                                                        key={icon}
                                                        type="button"
                                                        onClick={() => updateDay(i, 'icon', icon)}
                                                        className={`w-9 h-9 text-lg flex items-center justify-center border transition-all ${
                                                            day.icon === icon
                                                                ? 'border-[#B8962E] bg-[#B8962E]/10'
                                                                : 'border-[#1B2D5B]/10 hover:border-[#1B2D5B]/30'
                                                        }`}
                                                    >
                                                        {icon}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Title + Location */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1.5">
                                                <Label className="text-[9px] font-mono tracking-widests text-[#1B2D5B]/40 uppercase">
                                                    Titre *
                                                </Label>
                                                <Input
                                                    value={day.title}
                                                    onChange={e => updateDay(i, 'title', e.target.value)}
                                                    placeholder="ex: Arrivée & Accueil"
                                                    className="rounded-none border-[#1B2D5B]/15 h-9 text-sm"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-[9px] font-mono tracking-widests text-[#1B2D5B]/40 uppercase flex items-center gap-1">
                                                    <MapPin className="h-3 w-3" /> Lieu *
                                                </Label>
                                                <Input
                                                    value={day.location}
                                                    onChange={e => updateDay(i, 'location', e.target.value)}
                                                    placeholder="ex: Ouargla"
                                                    className="rounded-none border-[#1B2D5B]/15 h-9 text-sm"
                                                />
                                            </div>
                                        </div>

                                        {/* Lat + Lng */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1.5">
                                                <Label className="text-[9px] font-mono tracking-widests text-[#1B2D5B]/40 uppercase">
                                                    Latitude
                                                </Label>
                                                <Input
                                                    type="number"
                                                    step="0.0001"
                                                    value={day.lat || ''}
                                                    onChange={e => updateDay(i, 'lat', parseFloat(e.target.value) || 0)}
                                                    placeholder="ex: 31.9539"
                                                    className="rounded-none border-[#1B2D5B]/15 h-9 text-sm font-mono"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-[9px] font-mono tracking-widests text-[#1B2D5B]/40 uppercase">
                                                    Longitude
                                                </Label>
                                                <Input
                                                    type="number"
                                                    step="0.0001"
                                                    value={day.lng || ''}
                                                    onChange={e => updateDay(i, 'lng', parseFloat(e.target.value) || 0)}
                                                    placeholder="ex: 5.3329"
                                                    className="rounded-none border-[#1B2D5B]/15 h-9 text-sm font-mono"
                                                />
                                            </div>
                                        </div>

                                        {/* Description */}
                                        <div className="space-y-1.5">
                                            <Label className="text-[9px] font-mono tracking-widests text-[#1B2D5B]/40 uppercase">
                                                Description
                                            </Label>
                                            <Textarea
                                                value={day.description}
                                                onChange={e => updateDay(i, 'description', e.target.value)}
                                                placeholder="Décrivez cette journée..."
                                                className="rounded-none border-[#1B2D5B]/15 text-sm resize-none min-h-[70px]"
                                            />
                                        </div>

                                        {/* Overnight */}
                                        <div className="space-y-1.5">
                                            <Label className="text-[9px] font-mono tracking-widests text-[#1B2D5B]/40 uppercase flex items-center gap-1">
                                                <Bed className="h-3 w-3" /> Hébergement
                                            </Label>
                                            <Input
                                                value={day.overnight}
                                                onChange={e => updateDay(i, 'overnight', e.target.value)}
                                                placeholder="ex: Bivouac de luxe, Hôtel Zeriba..."
                                                className="rounded-none border-[#1B2D5B]/15 h-9 text-sm"
                                            />
                                        </div>

                                        {/* Meals */}
                                        <div className="space-y-1.5">
                                            <Label className="text-[9px] font-mono tracking-widests text-[#1B2D5B]/40 uppercase flex items-center gap-1">
                                                <Utensils className="h-3 w-3" /> Repas inclus
                                            </Label>
                                            <div className="flex gap-2">
                                                {MEAL_OPTIONS.map(meal => (
                                                    <button
                                                        key={meal}
                                                        type="button"
                                                        onClick={() => toggleMeal(i, meal)}
                                                        className={`flex-1 py-2 text-[10px] font-mono tracking-wide border transition-colors ${
                                                            day.meals.includes(meal)
                                                                ? 'bg-emerald-600 text-white border-emerald-600'
                                                                : 'border-[#1B2D5B]/15 text-[#1B2D5B]/40 hover:border-[#1B2D5B]/30'
                                                        }`}
                                                    >
                                                        {meal}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Activities */}
                                        <div className="space-y-1.5">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-[9px] font-mono tracking-widests text-[#1B2D5B]/40 uppercase flex items-center gap-1">
                                                    <Activity className="h-3 w-3" /> Activités
                                                </Label>
                                                <button
                                                    type="button"
                                                    onClick={() => addActivity(i)}
                                                    className="text-[9px] font-mono text-[#B8962E] uppercase tracking-widests flex items-center gap-1 hover:text-[#1B2D5B] transition-colors"
                                                >
                                                    <Plus className="h-3 w-3" /> Ajouter
                                                </button>
                                            </div>
                                            <div className="space-y-1.5">
                                                {day.activities.map((act, ai) => (
                                                    <div key={ai} className="flex items-center gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-[#B8962E] flex-shrink-0" />
                                                        <Input
                                                            value={act}
                                                            onChange={e => updateActivity(i, ai, e.target.value)}
                                                            placeholder={`Activité ${ai + 1}`}
                                                            className="rounded-none border-[#1B2D5B]/15 h-8 text-xs flex-1"
                                                        />
                                                        {day.activities.length > 1 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => removeActivity(i, ai)}
                                                                className="p-1 text-red-400 hover:text-red-600 transition-colors flex-shrink-0"
                                                            >
                                                                <Trash2 className="h-3 w-3" />
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                ))}
            </AnimatePresence>

            {/* Add day button at bottom */}
            {value.length > 0 && (
                <button
                    type="button"
                    onClick={addDay}
                    className="w-full py-3 border border-dashed border-[#1B2D5B]/15 text-[10px] font-mono tracking-widests text-[#1B2D5B]/30 uppercase hover:border-[#B8962E]/40 hover:text-[#B8962E] transition-all flex items-center justify-center gap-2"
                >
                    <Plus className="h-3.5 w-3.5" />
                    Ajouter le jour {value.length + 1}
                </button>
            )}
        </div>
    )
}
