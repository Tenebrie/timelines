import { createFileRoute } from '@tanstack/react-router'

import { AdminUsersView } from '@/app/views/admin/views/AdminUsersView'

export const Route = createFileRoute('/admin/users')({
	component: RouteComponent,
})

function RouteComponent() {
	return <AdminUsersView />
}
