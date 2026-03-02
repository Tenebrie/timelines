import { createFileRoute } from '@tanstack/react-router'

import { QrCodeGenerator } from '@/app/views/tools/qr-generator/QrCodeGenerator'

export const Route = createFileRoute('/tools/_tools/qr-generator')({
	component: RouteComponent,
})

function RouteComponent() {
	return <QrCodeGenerator />
}
