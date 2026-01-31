import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

import { CalendarEditorView } from '@/app/views/calendar/editor/CalendarEditorView'

export const Route = createFileRoute('/calendars/$calendarId')({
	component: RouteComponent,
	validateSearch: z.object({ unit: z.string().optional() }),
})

function RouteComponent() {
	const { calendarId } = Route.useParams()
	return <CalendarEditorView calendarId={calendarId} />
}
