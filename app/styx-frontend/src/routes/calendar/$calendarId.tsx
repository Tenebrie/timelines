import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

import { CalendarEditorTab } from '@/app/features/time/calendar/types'
import { CalendarEditorView } from '@/app/views/calendar/editor/CalendarEditorView'

export const Route = createFileRoute('/calendar/$calendarId')({
	component: RouteComponent,
	validateSearch: z.object({
		unit: z.string().optional(),
		presentation: z.string().optional(),
		tab: z.nativeEnum(CalendarEditorTab).optional().default(CalendarEditorTab.Info),
	}),
})

function RouteComponent() {
	const { calendarId } = Route.useParams()
	return <CalendarEditorView calendarId={calendarId} />
}
