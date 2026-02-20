import { createFileRoute } from '@tanstack/react-router'

import { CalendarsView } from '@/app/views/calendar/CalendarsView'

export const Route = createFileRoute('/calendar/')({
	component: RouteComponent,
})

function RouteComponent() {
	return <CalendarsView />
}
