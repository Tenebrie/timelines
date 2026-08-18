import Add from '@mui/icons-material/Add'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import useEvent from 'react-use-event-hook'

import { useCheckRouteMatch } from '@/router-utils/hooks/useCheckRouteMatch'
import { useStableNavigate } from '@/router-utils/hooks/useStableNavigate'

export function CreateEntityButton() {
	const isTimeline = useCheckRouteMatch('/world/$worldId/timeline')

	return <Box data-testid="CreateEntityButton">{isTimeline && <CreateEventButton />}</Box>
}

function CreateEventButton() {
	const navigate = useStableNavigate({ from: '/world/$worldId/timeline' })

	const onClick = useEvent(() => {
		navigate({ to: '/world/$worldId/timeline', search: (prev) => ({ ...prev, new: 'event', navi: [] }) })
	})

	return (
		<Button variant="contained" onClick={onClick} startIcon={<Add />} sx={{ height: '32px' }}>
			Create event
		</Button>
	)
}
