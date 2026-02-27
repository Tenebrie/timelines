import { createFileRoute } from '@tanstack/react-router'

import { ImageConverter } from '@/app/views/tools/image-converter/ImageConverter'

export const Route = createFileRoute('/tools/_tools/image-converter')({
	component: RouteComponent,
})

function RouteComponent() {
	return <ImageConverter />
}
