import { createFileRoute } from '@tanstack/react-router'

import { Music } from '@/app/views/music/Music'

export const Route = createFileRoute('/secret/music')({
	component: RouteComponent,
})

function RouteComponent() {
	return <Music />
}
