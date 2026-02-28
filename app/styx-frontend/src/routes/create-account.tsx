import { createFileRoute } from '@tanstack/react-router'

import CreateAccount from '@/app/views/create-account/CreateAccount'

export const Route = createFileRoute('/create-account')({
	component: RouteComponent,
})

function RouteComponent() {
	return <CreateAccount />
}
