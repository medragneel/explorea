import { SignIn } from '@clerk/nextjs'

export default function ConnexionPage() {
    return (
        <main className="flex justify-center items-center min-h-screen">
            <SignIn />
        </main>
    )
}
