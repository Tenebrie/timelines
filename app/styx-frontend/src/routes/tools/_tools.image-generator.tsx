import { createFileRoute } from '@tanstack/react-router'

import { ImageGenerator } from '@/app/views/tools/image-generator/ImageGenerator'

export const Route = createFileRoute('/tools/_tools/image-generator')({
	component: RouteComponent,
})

function RouteComponent() {
	return <ImageGenerator />
}
