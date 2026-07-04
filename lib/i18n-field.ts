// lib/i18n-field.ts

// ── getField ──────────────────────────────────────────────────────────────
// Reads from jsonb i18n object or falls back to plain string
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

// ── formatPrice ───────────────────────────────────────────────────────────
// ✅ Always uses Latin numerals (numberingSystem: 'latn') to prevent
//    hydration mismatch between server (Latin) and Arabic client (٠١٢٣٤٥٦٧٨٩)
export function formatPrice(
    amount: number,
    currency = 'DZD',
    locale = 'fr'
): string {
    // Normalize locale for Intl — use base language only, always with latn numerals
    // ar-u-nu-latn = Arabic language but Latin digit numerals
    const intlLocale = locale === 'ar' ? 'ar-u-nu-latn' : locale

    try {
        return new Intl.NumberFormat(intlLocale, {
            style: 'currency',
            currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
            numberingSystem: 'latn',  // ✅ force Latin digits always
        }).format(amount)
    } catch {
        // Fallback if currency code is invalid
        return `${amount.toLocaleString('fr-FR')} ${currency}`
    }
}
