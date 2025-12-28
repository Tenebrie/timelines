import { createFileRoute } from '@tanstack/react-router'

import { AdminView } from '@/app/views/admin/AdminView'

export const Route = createFileRoute('/admin')({
	component: RouteComponent,
})

function RouteComponent() {
	return <AdminView />
}
