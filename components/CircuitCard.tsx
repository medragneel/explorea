// components/CircuitCard.tsx
import Link from 'next/link'
import Image from 'next/image'
import { useTranslations, useLocale } from 'next-intl'
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, MapPin, Users, Clock } from 'lucide-react'
import type { Circuit } from '@/db/schema'

export default function CircuitCard({ circuit }: { circuit: Circuit }) {
    const t = useTranslations('circuits')
    const locale = useLocale()

    return (
        <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
            {/* Image */}
            <div className="relative h-52 overflow-hidden">
                <img
                    src={circuit.image || '/placeholder.jpg'}
                    alt={circuit.nom}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <Badge className="absolute top-3 left-3 bg-amber-500 hover:bg-amber-500">
                    {circuit.region}
                </Badge>
            </div>

            <CardHeader className="pb-2">
                <CardTitle className="text-lg">{circuit.nom}</CardTitle>
            </CardHeader>

            <CardContent className="pb-3">
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {circuit.description}
                </p>
                <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {circuit.duree} {t('days')}
                    </div>
                    <div className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {circuit.region}
                    </div>
                </div>
            </CardContent>

            <CardFooter className="flex items-center justify-between pt-3 border-t">
                <div>
                    <p className="text-xs text-muted-foreground">{t('price')}</p>
                    <p className="text-lg font-bold text-amber-600">
                        {circuit.prix.toLocaleString()} DZD
                    </p>
                </div>
                <Button size="sm" asChild>
                    <Link href={`/${locale}/circuits/${circuit.id}`}>
                        {t('book')}
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    )
}
