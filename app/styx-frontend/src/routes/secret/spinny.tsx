import { createFileRoute } from '@tanstack/react-router'

import { Spinny } from '@/app/views/spinny/Spinny'

export const Route = createFileRoute('/secret/spinny')({
	component: SpinnyComponent,
})

function SpinnyComponent() {
	return <Spinny />
}
