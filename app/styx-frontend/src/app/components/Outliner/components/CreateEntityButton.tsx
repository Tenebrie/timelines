import Add from '@mui/icons-material/Add'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { useNavigate } from '@tanstack/react-router'
import { useCallback } from 'react'

import { useCheckRouteMatch } from '@/router-utils/hooks/useCheckRouteMatch'

export function CreateEntityButton() {
	const isTimeline = useCheckRouteMatch('/world/$worldId/timeline')
	const isMindmap = useCheckRouteMatch('/world/$worldId/mindmap')

	return (
		<Box data-testid="CreateEntityButton">
			{isTimeline && <CreateEventButton />}
			{isMindmap && <CreateActorButton />}
		</Box>
	)
}

function CreateActorButton() {
	const navigate = useNavigate({ from: '/world/$worldId/mindmap' })

	const onClick = useCallback(() => {
		navigate({ to: '/world/$worldId/mindmap', search: (prev) => ({ ...prev, new: true }) })
	}, [navigate])

	return (
		<Button variant="contained" onClick={onClick} startIcon={<Add />} sx={{ height: '32px' }}>
			Create actor
		</Button>
	)
}

function CreateEventButton() {
	const navigate = useNavigate({ from: '/world/$worldId/timeline' })

	const onClick = useCallback(() => {
		navigate({ to: '/world/$worldId/timeline', search: (prev) => ({ ...prev, new: true }) })
	}, [navigate])

	return (
		<Button variant="contained" onClick={onClick} startIcon={<Add />} sx={{ height: '32px' }}>
			Create event
		</Button>
	)
}
