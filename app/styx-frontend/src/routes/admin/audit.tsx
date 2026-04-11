import { createFileRoute } from '@tanstack/react-router'

import { AdminAuditView } from '@/app/views/admin/views/AdminAuditView'

export const Route = createFileRoute('/admin/audit')({
	component: RouteComponent,
})

function RouteComponent() {
	return <AdminAuditView />
}
