import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/profile/')({
	beforeLoad: async () => {
		throw redirect({ to: '/profile/public' })
	},
})
