import { createFileRoute, redirect } from '@tanstack/react-router'

import { WorldManagementView } from '@/app/views/worldManagement/WorldManagementView'

export const Route = createFileRoute('/')({
	component: RouteComponent,
	beforeLoad: async () => {
		throw redirect({ to: '/home' })
	},
})

function RouteComponent() {
	return <WorldManagementView />
}
