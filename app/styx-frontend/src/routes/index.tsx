import { createFileRoute } from '@tanstack/react-router'

import { Home } from '@/app/features/home/Home'

import { checkUserAccess } from '../router-utils/checkUserAccess'

export const Route = createFileRoute('/')({
	component: HomeComponent,
	beforeLoad: ({ context }) => {
		checkUserAccess(context)
	},
})

function HomeComponent() {
	return <Home />
}
