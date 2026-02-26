import { createFileRoute } from '@tanstack/react-router'

import { HomeView } from '@/app/views/home/HomeView'

export const Route = createFileRoute('/')({
	component: RouteComponent,
})

function RouteComponent() {
	return <HomeView />
}
