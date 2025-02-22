import Menu from '@mui/icons-material/Menu'
import Public from '@mui/icons-material/Public'
import Button from '@mui/material/Button'
import { useNavigate } from '@tanstack/react-router'
import { useCallback } from 'react'
import { useSelector } from 'react-redux'

import { BaseNavigator } from '@/app/components/BaseNavigator'
import { getWorldState } from '@/app/features/world/selectors'

export const HomeNavigator = () => {
	const { id, isLoaded, timeOrigin } = useSelector(
		getWorldState,
		(a, b) => a.id === b.id && a.isLoaded === b.isLoaded && a.timeOrigin === b.timeOrigin,
	)
	const navigate = useNavigate({ from: '/home' })

	const onNavigateToLastWorld = useCallback(() => {
		if (!id && !isLoaded) {
			return
		}
		navigate({ to: `/world/$worldId/timeline`, params: { worldId: id }, search: { time: timeOrigin } })
	}, [id, isLoaded, navigate, timeOrigin])

	return (
		<BaseNavigator>
			{isLoaded && (
				<>
					<Button aria-label="Toggle" sx={{ visibility: 'hidden' }}>
						<Menu />
					</Button>
					<Button onClick={onNavigateToLastWorld} sx={{ gap: 0.5, padding: '8px 15px' }}>
						<Public /> World
					</Button>
				</>
			)}
		</BaseNavigator>
	)
}
