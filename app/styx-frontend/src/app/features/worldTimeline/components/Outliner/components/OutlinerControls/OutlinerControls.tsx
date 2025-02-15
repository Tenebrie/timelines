import Add from '@mui/icons-material/Add'
import Box from '@mui/material/Box'
import Fab from '@mui/material/Fab'
import { useNavigate } from '@tanstack/react-router'
import { useCallback } from 'react'

import { useEventBusDispatch } from '@/app/features/eventBus'
import { useIsReadOnly } from '@/app/hooks/useIsReadOnly'

export const OutlinerControls = () => {
	const { isReadOnly } = useIsReadOnly()

	const navigate = useNavigate({ from: '/world/$worldId/timeline/outliner' })
	const openEventDrawer = useEventBusDispatch({ event: 'timeline/openEventDrawer' })

	const onClick = useCallback(() => {
		openEventDrawer()
		navigate({
			to: '/world/$worldId/timeline/outliner',
			search: (prev) => ({ ...prev, selection: [] }),
		})
	}, [navigate, openEventDrawer])

	return (
		<Box sx={{ position: 'absolute', bottom: 64, right: 16, zIndex: 1000, pointerEvents: 'auto' }}>
			{!isReadOnly && (
				<Fab color="primary" onClick={onClick}>
					<Add />{' '}
				</Fab>
			)}
		</Box>
	)
}
