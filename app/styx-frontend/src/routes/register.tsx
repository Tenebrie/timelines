import { createFileRoute } from '@tanstack/react-router'

import Register from '@/app/features/auth/register/Register'

export const Route = createFileRoute('/register')({
	component: RegisterComponent,
})

function RegisterComponent() {
	return <Register />
}
