import { createFileRoute } from '@tanstack/react-router'

import { Home } from '@/app/views/home/Home'

export const Route = createFileRoute('/home')({
	component: RouteComponent,
})

function RouteComponent() {
	return <Home />
}
