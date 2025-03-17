import { createFileRoute, redirect } from '@tanstack/react-router'

import { Home } from '@/app/views/home/Home'

export const Route = createFileRoute('/')({
	component: RouteComponent,
	beforeLoad: async () => {
		throw redirect({ to: '/home' })
	},
})

function RouteComponent() {
	return <Home />
}
