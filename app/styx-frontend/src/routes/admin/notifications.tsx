import { createFileRoute } from '@tanstack/react-router'

import { AdminNotificationsView } from '@/app/views/admin/views/AdminNotificationsView'

export const Route = createFileRoute('/admin/notifications')({
	component: RouteComponent,
})

function RouteComponent() {
	return <AdminNotificationsView />
}
