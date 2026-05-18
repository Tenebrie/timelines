import { createFileRoute } from '@tanstack/react-router'

import { MigrationPage } from '@/app/views/profile/pages/MigrationPage'

export const Route = createFileRoute('/profile/_profile/migration')({
	component: RouteComponent,
})

function RouteComponent() {
	return <MigrationPage />
}
