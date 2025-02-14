import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'

import { useCurrentOrNewEvent } from '../../hooks/useCurrentOrNewEvent'
import { usePreserveCreateState } from '../EventEditor/components/EventDetailsEditor/hooks/usePreserveCreateState'
import { useEventDraft } from '../EventEditor/components/EventDetailsEditor/useEventFields'
import { EventDescription } from './EventDescription'
import { EventTitle } from './EventTitle'

export const EventDetails = () => {
	const { mode, event } = useCurrentOrNewEvent()
	const draft = useEventDraft({ event })

	usePreserveCreateState({ mode, draft })

	return (
		<Box
			sx={{
				padding: 2,
				paddingTop: 3,
				// width: 'calc(100% - 64px)',
				// height: 'calc(100% - 128px)',
				// maxWidth: '1000px',
				// maxHeight: 'calc(100% - 16px)',
				overflowY: 'auto',
				position: 'relative',
			}}
		>
			<Stack gap={1} height={'calc(100%)'}>
				<Stack gap={1}>
					<EventTitle draft={draft} />
					<Divider />
				</Stack>
				<Box height={'calc(100% - 64px)'}>
					<EventDescription id={event.id} draft={draft} />
				</Box>
			</Stack>
		</Box>
	)
}
