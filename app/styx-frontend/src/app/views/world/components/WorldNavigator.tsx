import Menu from '@mui/icons-material/Menu'
import Button from '@mui/material/Button'
import { memo } from 'react'
import { useDispatch } from 'react-redux'

import { SummonableNavigatorContextButton } from '@/app/features/navigation/components/NavigatorSummonables'

export const WorldNavigator = memo(WorldNavigatorComponent)

export function WorldNavigatorComponent() {
	const dispatch = useDispatch()

	return (
		<SummonableNavigatorContextButton>
			<Button aria-label="Toggle" sx={{ height: '100%' }}>
				<Menu />
			</Button>
		</SummonableNavigatorContextButton>
	)
}
