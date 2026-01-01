import { createFileRoute } from '@tanstack/react-router'

import { SecurityPage } from '@/app/views/profile/pages/SecurityPage'

export const Route = createFileRoute('/profile/_profile/security')({
	component: RouteComponent,
})

function RouteComponent() {
	return <SecurityPage />
}
