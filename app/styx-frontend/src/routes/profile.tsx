import { createFileRoute } from '@tanstack/react-router'

import { ProfileView } from '@/app/views/profile/ProfileView'

export const Route = createFileRoute('/profile')({
	component: RouteComponent,
})

function RouteComponent() {
	return <ProfileView />
}
