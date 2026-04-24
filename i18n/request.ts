import { getRequestConfig } from 'next-intl/server'
import { locales, defaultLocale } from '@/i18n/config'

export default getRequestConfig(async ({ requestLocale }) => {
    let locale = await requestLocale

    // ✅ Fall back to default if locale is missing or invalid
    if (!locale || !locales.includes(locale as any)) {
        locale = defaultLocale
    }

    return {
        locale,
        messages: (await import(`../messages/${locale}.json`)).default,
    }
})
