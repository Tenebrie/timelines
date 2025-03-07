import Box from '@mui/material/Box'
import { useNavigate } from '@tanstack/react-router'
import useEvent from 'react-use-event-hook'

export function MindmapClickArea() {
	const navigate = useNavigate({ from: '/world/$worldId/mindmap' })

	const onClick = useEvent(() => {
		navigate({ search: (prev) => ({ ...prev, selection: [] }) })
	})

	return (
		<Box
			sx={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0 }}
			onClick={onClick}
		></Box>
	)
}
