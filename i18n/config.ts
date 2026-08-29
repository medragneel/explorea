// i18n/config.ts
export const locales = ['fr', 'ar', 'en','es','it'] as const
export const defaultLocale = 'fr'
export type Locale = typeof locales[number]
