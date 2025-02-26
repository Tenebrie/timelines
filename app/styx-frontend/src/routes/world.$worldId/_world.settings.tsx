import { createFileRoute } from '@tanstack/react-router'

import { Settings } from '@/app/views/world/views/settings/SettingsView'

export const Route = createFileRoute('/world/$worldId/_world/settings')({
	component: WorldDetailsComponent,
})

function WorldDetailsComponent() {
	return <Settings />
}
