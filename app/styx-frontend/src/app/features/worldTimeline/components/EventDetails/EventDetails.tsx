import Box from '@mui/material/Box'
import Collapse from '@mui/material/Collapse'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import { useNavigate } from '@tanstack/react-router'
import { memo } from 'react'
import { useSelector } from 'react-redux'

import { ColorPicker } from '@/app/components/ColorPicker/ColorPicker'
import { getEditingPreferences } from '@/app/features/preferences/selectors'
import { useUpsertEvent } from '@/app/features/worldTimeline/hooks/useUpsertEvent'

import { useCurrentOrNewEvent } from '../../hooks/useCurrentOrNewEvent'
import { useEventDraft } from '../EventEditor/components/EventDetailsEditor/useEventFields'
import { EventDescription } from './EventDescription'
import { EventTitle } from './EventTitle'

export const EventDetails = memo(EventDetailsComponent)

export function EventDetailsComponent() {
	const { mode, event } = useCurrentOrNewEvent()
	const draft = useEventDraft({ event })
	const navigate = useNavigate({ from: '/world/$worldId/timeline' })
	const { eventColorPickerOpen } = useSelector(
		getEditingPreferences,
		(a, b) => a.eventColorPickerOpen === b.eventColorPickerOpen,
	)

	useUpsertEvent({
		mode,
		draft,
		onCreate: (createdEvent) => {
			navigate({
				to: '/world/$worldId/timeline',
				search: (prev) => ({ ...prev, selection: [`issuedAt-${createdEvent.id}`] }),
			})
		},
	})

	return (
		<Stack
			gap={1}
			sx={{
				padding: '24px 16px',
				overflowY: 'auto',
			}}
		>
			<EventTitle event={event} draft={draft} />
			<Divider />
			<Collapse in={eventColorPickerOpen} sx={{ overflow: 'hidden' }} timeout={300} easing={'ease-in-out'}>
				<ColorPicker key={draft.id} initialValue={draft.color} onChangeHex={draft.setColor} />
			</Collapse>
			<Box flexGrow={1}>
				<EventDescription draft={draft} />
			</Box>
		</Stack>
	)
}
