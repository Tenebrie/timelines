import { createFileRoute } from '@tanstack/react-router'

import { Admin } from '@/app/features/admin/Admin'

import { checkUserAccess } from '../router-utils/checkUserAccess'

export const Route = createFileRoute('/admin')({
	component: Admin,
	beforeLoad: ({ context }) => {
		checkUserAccess(context)
	},
})
