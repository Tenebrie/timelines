import { createFileRoute } from '@tanstack/react-router'

import { Login } from '@/app/features/auth/login/Login'

export const Route = createFileRoute('/login')({
	component: Login,
})
