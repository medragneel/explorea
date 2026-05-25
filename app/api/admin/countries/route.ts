// app/api/admin/countries/route.ts
import { NextResponse } from 'next/server'
import { db } from '@/db'
import { countries } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function GET() {
    try {
        const all = await db.select().from(countries).orderBy(countries.continent, countries.code)
        return NextResponse.json({ success: true, data: all })
    } catch (error) {
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const required = ['code', 'name', 'continent', 'currency']
        for (const f of required) {
            if (!body[f]) return NextResponse.json({ success: false, error: `Champ manquant: ${f}` }, { status: 400 })
        }

        const [country] = await db
            .insert(countries)
            .values({
                code: body.code.toUpperCase(),
                name: body.name,
                continent: body.continent,
                currency: body.currency.toUpperCase(),
                flag: body.flag || null,
                image: body.image || null,
                actif: body.actif ?? true,
            })
            .returning()

        return NextResponse.json({ success: true, data: country }, { status: 201 })
    } catch (error) {
        console.error('POST countries error:', error)
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
    }
}

export async function PATCH(request: Request) {
    try {
        const body = await request.json()
        const { id, ...updates } = body

        const [updated] = await db
            .update(countries)
            .set({
                ...(updates.code && { code: updates.code.toUpperCase() }),
                ...(updates.name && { name: updates.name }),
                ...(updates.continent && { continent: updates.continent }),
                ...(updates.currency && { currency: updates.currency.toUpperCase() }),
                ...(updates.flag !== undefined && { flag: updates.flag }),
                ...(updates.image !== undefined && { image: updates.image }),
                ...(updates.actif !== undefined && { actif: updates.actif }),
            })
            .where(eq(countries.id, id))
            .returning()

        return NextResponse.json({ success: true, data: updated })
    } catch (error) {
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')
        if (!id) return NextResponse.json({ success: false, error: 'ID manquant' }, { status: 400 })
        await db.delete(countries).where(eq(countries.id, id))
        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
    }
}
