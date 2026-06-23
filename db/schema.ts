// db/schema.ts
import {
    pgTable, text, integer, boolean,
    timestamp, real, uuid, jsonb, pgEnum
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// ─── Enums ────────────────────────────────────────────────────────────────

export const difficultyEnum = pgEnum('difficulty', [
    'easy', 'moderate', 'challenging', 'expedition'
])

// export const reservationStatutEnum = pgEnum('reservation_statut', [
//     'pending', 'confirmed', 'cancelled', 'completed'
// ])

export const categoryEnum = pgEnum('category', [
    'adventure', 'cultural', 'wildlife', 'luxury',
    'family', 'honeymoon', 'photography', 'trekking'
])

// ─── COUNTRIES ───────────────────────────────────────────────────────────

export const countries = pgTable('countries', {
    id: uuid('id').defaultRandom().primaryKey(),
    code: text('code').notNull().unique(),   // 'DZ', 'MA', 'TN', 'EG'...
    // Translated names stored as JSON
    name: jsonb('name').notNull(),            // { fr: 'Algérie', ar: 'الجزائر', en: 'Algeria' }
    continent: text('continent').notNull(),        // 'Africa', 'Asia', 'Europe'...
    currency: text('currency').notNull(),         // 'DZD', 'MAD', 'EUR', 'USD'
    flag: text('flag'),                       // '🇩🇿'
    image: text('image'),
    actif: boolean('actif').default(true),
    createdAt: timestamp('created_at').defaultNow(),
})

// ─── DESTINATIONS ─────────────────────────────────────────────────────────

export const destinations = pgTable('destinations', {
    id: uuid('id').defaultRandom().primaryKey(),
    countryId: uuid('country_id').references(() => countries.id),
    // Multilingual content
    name: jsonb('name').notNull(),            // { fr: 'Sahara', ar: 'الصحراء', en: 'Sahara' }
    description: jsonb('description').notNull(),     // { fr: '...', ar: '...', en: '...' }
    region: text('region'),                     // 'South Algeria'
    image: text('image'),
    images: jsonb('images').default('[]'),      // string[]
    lat: real('lat'),
    lng: real('lng'),
    actif: boolean('actif').default(true),
    createdAt: timestamp('created_at').defaultNow(),
})

// ─── CIRCUITS ─────────────────────────────────────────────────────────────

export const circuits = pgTable('circuits', {
    id: uuid('id').defaultRandom().primaryKey(),
    destinationId: uuid('destination_id').references(() => destinations.id),
    countryId: uuid('country_id').references(() => countries.id),

    // Multilingual
    nom: text('nom').notNull(),
    description: text('description').notNull(),
    nomI18n: jsonb('nom_i18n'),          // { fr, ar, en } — null on old rows
    descriptionI18n: jsonb('description_i18n'),  // null on old rows
    itinerary: jsonb('itinerary').default('[]'),  // ItineraryDay[]

    // Pricing in local currency
    prix: real('prix').notNull(),
    currency: text('currency').notNull().default('DZD'),
    prixEur: real('prix_eur'),                  // auto-converted for display
    prixUsd: real('prix_usd'),

    duree: integer('duree').notNull(),
    difficulty: difficultyEnum('difficulty').default('moderate'),
    category: categoryEnum('category').default('adventure'),

    // Media
    image: text('image'),
    images: jsonb('images').default('[]'),     // string[]
    videoUrl: text('video_url'),

    // SEO & discovery
    tags: jsonb('tags').default('[]'),       // ['sahara', 'desert', 'camping']
    highlights: jsonb('highlights').default('[]'), // { icon, title, desc }[]
    included: jsonb('included').default('[]'),   // string[]
    notIncluded: jsonb('not_included').default('[]'),

    // Logistics
    minPersonnes: integer('min_personnes').default(1),
    maxPersonnes: integer('max_personnes').default(12),
    departureCity: text('departure_city'),           // 'Algiers', 'Marrakech'
    region: text('region'),

    actif: boolean('actif').default(true),
    featured: boolean('featured').default(false),
    createdAt: timestamp('created_at').defaultNow(),
})

// ─── DEPARTS ──────────────────────────────────────────────────────────────

export const departs = pgTable('departs', {
    id: uuid('id').defaultRandom().primaryKey(),
    circuitId: uuid('circuit_id').references(() => circuits.id),
    date: timestamp('date').notNull(),
    dateFin: timestamp('date_fin'),
    placesMax: integer('places_max').notNull(),
    placesRestantes: integer('places_restantes').notNull(),
    prixSpecial: real('prix_special'),           // override circuit price
    notes: text('notes'),
})

// ─── CLIENTS ──────────────────────────────────────────────────────────────

export const clients = pgTable('clients', {
    id: uuid('id').defaultRandom().primaryKey(),
    nom: text('nom').notNull(),
    telephone: text('telephone').notNull(),
    email: text('email'),
    country: text('country'),                    // 'FR', 'DZ', 'GB' — ISO code
    city: text('city'),                       // free text, no wilaya restriction
    createdAt: timestamp('created_at').defaultNow(),
})

// ─── RESERVATIONS ─────────────────────────────────────────────────────────

export const reservations = pgTable('reservations', {
    id: uuid('id').defaultRandom().primaryKey(),
    departId: uuid('depart_id').references(() => departs.id),
    clientId: uuid('client_id').references(() => clients.id),
    clerkUserId: text('clerk_user_id'),          // optional — guest bookings allowed
    nombrePersonnes: integer('nombre_personnes').notNull(),
    statut: text('statut').default('en_attente'),
    // Pricing snapshot at time of booking
    prixTotal: real('prix_total'),
    currency: text('currency').default('DZD'),
    notes: text('notes'),
    // Payment
    paymentMethod: text('payment_method').default('cash'),
    paymentStatus: text('payment_status').default('unpaid'),
    createdAt: timestamp('created_at').defaultNow(),
})

// ─── REVIEWS ──────────────────────────────────────────────────────────────

export const reviews = pgTable('reviews', {
    id: uuid('id').defaultRandom().primaryKey(),
    circuitId: uuid('circuit_id').references(() => circuits.id),
    clientId: uuid('client_id').references(() => clients.id),
    rating: integer('rating').notNull(),         // 1-5
    comment: text('comment'),
    approved: boolean('approved').default(false),
    createdAt: timestamp('created_at').defaultNow(),
})

// ─── RELATIONS ────────────────────────────────────────────────────────────

export const countriesRelations = relations(countries, ({ many }) => ({
    destinations: many(destinations),
    circuits: many(circuits),
}))

export const destinationsRelations = relations(destinations, ({ one, many }) => ({
    country: one(countries, { fields: [destinations.countryId], references: [countries.id] }),
    circuits: many(circuits),
}))

export const circuitsRelations = relations(circuits, ({ one, many }) => ({
    destination: one(destinations, { fields: [circuits.destinationId], references: [destinations.id] }),
    country: one(countries, { fields: [circuits.countryId], references: [countries.id] }),
    departs: many(departs),
    reviews: many(reviews),
}))

export const departsRelations = relations(departs, ({ one, many }) => ({
    circuit: one(circuits, { fields: [departs.circuitId], references: [circuits.id] }),
    reservations: many(reservations),
}))

export const reservationsRelations = relations(reservations, ({ one }) => ({
    depart: one(departs, { fields: [reservations.departId], references: [departs.id] }),
    client: one(clients, { fields: [reservations.clientId], references: [clients.id] }),
}))

export const reviewsRelations = relations(reviews, ({ one }) => ({
    circuit: one(circuits, { fields: [reviews.circuitId], references: [circuits.id] }),
    client: one(clients, { fields: [reviews.clientId], references: [clients.id] }),
}))

// ─── Types ────────────────────────────────────────────────────────────────

export type Country = typeof countries.$inferSelect
export type Destination = typeof destinations.$inferSelect
export type Circuit = typeof circuits.$inferSelect
export type NewCircuit = typeof circuits.$inferInsert
export type Depart = typeof departs.$inferSelect
export type Client = typeof clients.$inferSelect
export type Reservation = typeof reservations.$inferSelect
export type Review = typeof reviews.$inferSelect
