import { createFileRoute } from '@tanstack/react-router'

import { Admin } from '@/app/features/admin/Admin'

export const Route = createFileRoute('/admin')({
	component: AdminComponent,
})

function AdminComponent() {
	return <Admin />
}
