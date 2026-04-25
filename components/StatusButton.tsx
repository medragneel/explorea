'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { CheckCircle, XCircle, ChevronDown, Loader2 } from 'lucide-react'

type Statut = 'en_attente' | 'confirme' | 'annule'

interface StatusButtonProps {
    id: string
    currentStatut?: Statut
}

const STATUS_CONFIG = {
    en_attente: {
        label: '⏳ En attente',
        variant: 'secondary' as const,
        className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200',
    },
    confirme: {
        label: '✅ Confirmé',
        variant: 'default' as const,
        className: 'bg-green-100 text-green-800 hover:bg-green-100 border-green-200',
    },
    annule: {
        label: '❌ Annulé',
        variant: 'destructive' as const,
        className: 'bg-red-100 text-red-800 hover:bg-red-100 border-red-200',
    },
}

export default function StatusButton({ id, currentStatut = 'en_attente' }: StatusButtonProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [confirmDialog, setConfirmDialog] = useState<{
        open: boolean
        newStatut: Statut | null
        label: string
    }>({ open: false, newStatut: null, label: '' })

    async function handleStatusChange(newStatut: Statut) {
        setLoading(true)
        try {
            const res = await fetch(`/api/reservations/${id}/statut`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ statut: newStatut }),
            })

            if (!res.ok) throw new Error('Erreur serveur')

            router.refresh() // ✅ re-fetch server component data
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
            setConfirmDialog({ open: false, newStatut: null, label: '' })
        }
    }

    function requestStatusChange(newStatut: Statut) {
        if (newStatut === currentStatut) return
        setConfirmDialog({
            open: true,
            newStatut,
            label: STATUS_CONFIG[newStatut].label,
        })
    }

    const current = STATUS_CONFIG[currentStatut]

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={loading}
                        className={`h-8 gap-1.5 text-xs font-medium border ${current.className}`}
                    >
                        {loading
                            ? <Loader2 className="h-3 w-3 animate-spin" />
                            : <span>{current.label}</span>
                        }
                        <ChevronDown className="h-3 w-3 opacity-60" />
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuLabel className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase">
                        Changer le statut
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                        onClick={() => requestStatusChange('confirme')}
                        disabled={currentStatut === 'confirme'}
                        className="gap-2 cursor-pointer text-green-700 focus:text-green-700 focus:bg-green-50"
                    >
                        <CheckCircle className="h-3.5 w-3.5" />
                        Confirmer
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        onClick={() => requestStatusChange('annule')}
                        disabled={currentStatut === 'annule'}
                        className="gap-2 cursor-pointer text-red-700 focus:text-red-700 focus:bg-red-50"
                    >
                        <XCircle className="h-3.5 w-3.5" />
                        Annuler
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        onClick={() => requestStatusChange('en_attente')}
                        disabled={currentStatut === 'en_attente'}
                        className="gap-2 cursor-pointer text-yellow-700 focus:text-yellow-700 focus:bg-yellow-50"
                    >
                        <Loader2 className="h-3.5 w-3.5" />
                        Remettre en attente
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* ── Confirmation dialog ─────────────────────────────────── */}
            <AlertDialog
                open={confirmDialog.open}
                onOpenChange={(open) =>
                    setConfirmDialog((prev) => ({ ...prev, open }))
                }
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirmer le changement</AlertDialogTitle>
                        <AlertDialogDescription>
                            Voulez-vous changer le statut de cette réservation vers{' '}
                            <span className="font-semibold text-foreground">
                                {confirmDialog.label}
                            </span>{' '}
                            ?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={loading}>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                            disabled={loading}
                            onClick={() => {
                                if (confirmDialog.newStatut) {
                                    handleStatusChange(confirmDialog.newStatut)
                                }
                            }}
                            className="bg-[#1B2D5B] hover:bg-[#1B2D5B]/90 text-white"
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Confirmer
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
