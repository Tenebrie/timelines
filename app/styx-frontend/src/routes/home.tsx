import { createFileRoute } from '@tanstack/react-router'

import { Home } from '@/app/features/home/Home'

import { checkUserAccess } from '../router-utils/checkUserAccess'

export const Route = createFileRoute('/home')({
	component: Home,
	beforeLoad: ({ context }) => {
		checkUserAccess(context)
	},
})
