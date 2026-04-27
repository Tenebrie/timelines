import { createFileRoute } from '@tanstack/react-router'

import { PreferencesPage } from '@/app/views/profile/pages/PreferencesPage'

export const Route = createFileRoute('/profile/_profile/preferences')({
	component: RouteComponent,
})

function RouteComponent() {
	return <PreferencesPage />
}
