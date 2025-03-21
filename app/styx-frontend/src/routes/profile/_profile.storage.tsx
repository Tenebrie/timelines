import { createFileRoute } from '@tanstack/react-router'

import { StoragePage } from '@/app/views/profile/pages/StoragePage'

export const Route = createFileRoute('/profile/_profile/storage')({
	component: RouteComponent,
})

function RouteComponent() {
	return <StoragePage />
}
