import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'

import { useCurrentOrNewEvent } from '../../hooks/useCurrentOrNewEvent'

type Props = {
	onClick: () => void
	visible: boolean
}

export const CollapsedEventDetails = ({ onClick, visible }: Props) => {
	const { event } = useCurrentOrNewEvent()

	return (
		<Stack direction="row" justifyContent="flex-end" sx={{ pointerEvents: 'none' }}>
			<Button
				color="secondary"
				sx={{
					pointerEvents: visible ? 'auto' : 'none',
					minWidth: 140,
					maxWidth: '100px',
					background: 'rgba(0, 0, 0, 50%)',
					borderRadius: '0 0 16px 16px',
					'&:hover': {
						background: 'rgba(0, 0, 0, 70%)',
					},
				}}
				onClick={onClick}
			>
				{event.name ? 'Edit event' : 'Create event'}
			</Button>
		</Stack>
	)
}
