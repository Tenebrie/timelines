import { createFileRoute } from '@tanstack/react-router'

import { PublicProfilePage } from '@/app/views/profile/pages/PublicProfilePage'

export const Route = createFileRoute('/profile/_profile/public')({
	component: RouteComponent,
})

function RouteComponent() {
	return <PublicProfilePage />
}
