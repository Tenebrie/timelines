import { createFileRoute } from '@tanstack/react-router'

import { WorldManagementView } from '@/app/views/worldManagement/WorldManagementView'

export const Route = createFileRoute('/world/')({
	component: RouteComponent,
})

function RouteComponent() {
	return <WorldManagementView />
}
