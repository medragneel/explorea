import { UserProfile } from '@clerk/nextjs'

export default function ProfilPage() {
    return (
        <main className="flex justify-center py-10">
            <UserProfile />
        </main>
    )
}
