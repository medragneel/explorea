// lib/i18n-field.ts
export function getField(
    field: string | Record<string, string> | unknown | null | undefined,
    locale: string,
    fallback = ''
): string {
    if (!field) return fallback
    if (typeof field === 'string') return field
    if (typeof field === 'object') {
        const obj = field as Record<string, string>
        return obj[locale] ?? obj['fr'] ?? obj['en'] ?? fallback
    }
    return fallback
}

export function formatPrice(
    amount: number,
    currency = 'DZD',
    locale = 'fr'
): string {
    try {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount)
    } catch {
        return `${amount.toLocaleString()} ${currency}`
    }
}
