import { createFileRoute } from '@tanstack/react-router'

import { AdminDashboardView } from '@/app/views/admin/views/AdminDashboardView'

export const Route = createFileRoute('/admin/')({
	component: RouteComponent,
})

function RouteComponent() {
	return <AdminDashboardView />
}
