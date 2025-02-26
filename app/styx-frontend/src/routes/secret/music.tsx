import { createFileRoute } from '@tanstack/react-router'

import { Music } from '@/app/views/music/Music'

export const Route = createFileRoute('/secret/music')({
	component: MusicComponent,
})

function MusicComponent() {
	return <Music />
}
