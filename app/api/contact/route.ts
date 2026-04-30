// app/api/contact/route.ts
import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { nom, email, telephone, sujet, message, wilaya } = body

        // Validate
        if (!nom || !message || !sujet) {
            return NextResponse.json(
                { success: false, error: 'Champs requis manquants' },
                { status: 400 }
            )
        }

        // Send email to the agency
        await resend.emails.send({
            from: 'Explorea Contact <onboarding@resend.dev>',
            to: process.env.CONTACT_EMAIL!,
            subject: `[Explorea] ${sujet} — ${nom}`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: #1B2D5B; padding: 24px; text-align: center;">
                        <h1 style="color: #B8962E; margin: 0; font-size: 24px; font-weight: 300;">
                            EXPLOREA
                        </h1>
                        <p style="color: rgba(255,255,255,0.5); margin: 4px 0 0; font-size: 12px;">
                            Nouveau message de contact
                        </p>
                    </div>

                    <div style="padding: 32px; background: #fff; border: 1px solid #eee;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #999; font-size: 12px; width: 120px;">NOM</td>
                                <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #1B2D5B; font-size: 14px;">${nom}</td>
                            </tr>
                            ${email ? `
                            <tr>
                                <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #999; font-size: 12px;">EMAIL</td>
                                <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #1B2D5B; font-size: 14px;">
                                    <a href="mailto:${email}" style="color: #B8962E;">${email}</a>
                                </td>
                            </tr>` : ''}
                            ${telephone ? `
                            <tr>
                                <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #999; font-size: 12px;">TÉLÉPHONE</td>
                                <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #1B2D5B; font-size: 14px;">
                                    <a href="tel:${telephone}" style="color: #B8962E;">${telephone}</a>
                                </td>
                            </tr>` : ''}
                            ${wilaya ? `
                            <tr>
                                <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #999; font-size: 12px;">WILAYA</td>
                                <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #1B2D5B; font-size: 14px;">${wilaya}</td>
                            </tr>` : ''}
                            <tr>
                                <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #999; font-size: 12px;">SUJET</td>
                                <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #1B2D5B; font-size: 14px; font-weight: 600;">${sujet}</td>
                            </tr>
                        </table>

                        <div style="margin-top: 24px;">
                            <p style="color: #999; font-size: 12px; margin-bottom: 8px;">MESSAGE</p>
                            <div style="background: #F9F7F4; padding: 16px; border-left: 3px solid #B8962E; color: #1B2D5B; font-size: 14px; line-height: 1.7; white-space: pre-wrap;">${message}</div>
                        </div>
                    </div>

                    <div style="padding: 16px; text-align: center; background: #F9F7F4; border: 1px solid #eee; border-top: none;">
                        <p style="color: #999; font-size: 11px; margin: 0;">
                            Explorea · Explorez sans limites · contact@explorea.dz
                        </p>
                    </div>
                </div>
            `,
        })

        // Send confirmation email to the visitor (if they provided email)
        if (email) {
            await resend.emails.send({
                from: 'Explorea <onboarding@resend.dev>',
                to: email,
                subject: 'Nous avons bien reçu votre message — Explorea',
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                        <div style="background: #1B2D5B; padding: 24px; text-align: center;">
                            <h1 style="color: #B8962E; margin: 0; font-size: 24px; font-weight: 300;">EXPLOREA</h1>
                            <p style="color: rgba(255,255,255,0.5); margin: 4px 0 0; font-size: 12px;">Explorez sans limites</p>
                        </div>
                        <div style="padding: 32px; background: #fff; border: 1px solid #eee;">
                            <p style="color: #1B2D5B; font-size: 16px; font-weight: 300;">Bonjour ${nom},</p>
                            <p style="color: #666; font-size: 14px; line-height: 1.7;">
                                Nous avons bien reçu votre message concernant <strong style="color: #1B2D5B;">${sujet}</strong>.
                                Notre équipe vous répondra dans les <strong>24 à 48 heures</strong>.
                            </p>
                            <p style="color: #666; font-size: 14px; line-height: 1.7;">
                                Pour toute urgence, vous pouvez nous joindre directement au
                                <a href="tel:+21321XXXXXX" style="color: #B8962E;">+213 21 XX XX XX</a>.
                            </p>
                            <div style="margin-top: 24px; padding: 16px; background: #F9F7F4; border-left: 3px solid #B8962E;">
                                <p style="color: #999; font-size: 12px; margin: 0 0 4px;">Votre message :</p>
                                <p style="color: #1B2D5B; font-size: 13px; margin: 0; white-space: pre-wrap;">${message}</p>
                            </div>
                        </div>
                        <div style="padding: 16px; text-align: center; background: #F9F7F4; border: 1px solid #eee; border-top: none;">
                            <p style="color: #999; font-size: 11px; margin: 0;">
                                © 2025 Explorea · Algérie
                            </p>
                        </div>
                    </div>
                `,
            })
        }

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('Contact email error:', error)
        return NextResponse.json(
            { success: false, error: String(error) },
            { status: 500 }
        )
    }
}
