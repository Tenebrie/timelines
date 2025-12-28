import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/tools/')({
	beforeLoad: async () => {
		throw redirect({ to: '/tools/image-converter' })
	},
})
