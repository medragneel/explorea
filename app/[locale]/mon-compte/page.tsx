import { currentUser } from '@clerk/nextjs/server'

export default async function MonComptePage() {
    const user = await currentUser()

    return (
        <main>
            <h1>Bonjour, {user?.firstName} 👋</h1>
            <p>Email : {user?.emailAddresses[0].emailAddress}</p>
        </main>
    )
}
