import { createFileRoute } from '@tanstack/react-router'

import { ToolsView } from '@/app/views/tools/ToolsView'

export const Route = createFileRoute('/tools')({
	component: RouteComponent,
})

function RouteComponent() {
	return <ToolsView />
}
