import {
    pgTable,
    text,
    integer,
    boolean,
    timestamp,
    real,
    uuid,
} from 'drizzle-orm/pg-core'

// ─── CIRCUITS ────────────────────────────────
export const circuits = pgTable('circuits', {
    id: uuid('id').defaultRandom().primaryKey(),
    nom: text('nom').notNull(),
    description: text('description').notNull(),
    prix: real('prix').notNull(),
    duree: integer('duree').notNull(),      // en jours
    region: text('region').notNull(),
    image: text('image'),
    actif: boolean('actif').default(true),
    createdAt: timestamp('created_at').defaultNow(),
})

// ─── DEPARTS ─────────────────────────────────
export const departs = pgTable('departs', {
    id: uuid('id').defaultRandom().primaryKey(),
    circuitId: uuid('circuit_id').references(() => circuits.id),
    date: timestamp('date').notNull(),
    placesMax: integer('places_max').notNull(),
    placesRestantes: integer('places_restantes').notNull(),
})

// ─── CLIENTS ─────────────────────────────────
export const clients = pgTable('clients', {
    id: uuid('id').defaultRandom().primaryKey(),
    nom: text('nom').notNull(),
    telephone: text('telephone').notNull(),
    email: text('email'),
    wilaya: text('wilaya').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
})

// ─── RESERVATIONS ────────────────────────────
export const reservations = pgTable('reservations', {
    id: uuid('id').defaultRandom().primaryKey(),
    departId: uuid('depart_id').references(() => departs.id),
    clerkUserId: text('clerk_user_id').notNull(),
    nombrePersonnes: integer('nombre_personnes').notNull(),
    statut: text('statut').default('en_attente'), // en_attente | confirme | annule
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow(),
})

// ─── Types inférés automatiquement ───────────
export type Circuit = typeof circuits.$inferSelect
export type NewCircuit = typeof circuits.$inferInsert
export type Reservation = typeof reservations.$inferSelect
export type Client = typeof clients.$inferSelect
