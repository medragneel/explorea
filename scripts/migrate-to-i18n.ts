// scripts/migrate-to-i18n.ts
import * as dotenv from 'dotenv'
import { resolve } from 'path'

// ✅ Load .env.local BEFORE importing db
dotenv.config({ path: resolve(process.cwd(), '.env.local') })

// Now import db AFTER env is loaded
import { db } from '../db/index'
import { circuits } from '../db/schema'
import { eq } from 'drizzle-orm'

async function migrate() {
    console.log('Connecting to:', process.env.DATABASE_URL?.replace(/:.*@/, ':****@'))

    const all = await db.select().from(circuits)
    console.log(`Found ${all.length} circuits to migrate`)

    for (const circuit of all) {
        if (circuit.nomI18n) {
            console.log(`⏭ Skipping ${circuit.nom} — already migrated`)
            continue
        }

        await db
            .update(circuits)
            .set({
                nomI18n: { fr: circuit.nom, ar: circuit.nom, en: circuit.nom },
                descriptionI18n: {
                    fr: circuit.description,
                    ar: circuit.description,
                    en: circuit.description,
                },
            })
            .where(eq(circuits.id, circuit.id))

        console.log(`✅ Migrated: ${circuit.nom}`)
    }

    console.log('Done')
    process.exit(0)
}

migrate().catch(e => {
    console.error(e)
    process.exit(1)
})
