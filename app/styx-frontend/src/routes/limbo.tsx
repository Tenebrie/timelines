import { createFileRoute } from '@tanstack/react-router'

import { Limbo } from '@/app/features/auth/limbo/Limbo'

export const Route = createFileRoute('/limbo')({
	component: LimboComponent,
})

function LimboComponent() {
	return <Limbo />
}
