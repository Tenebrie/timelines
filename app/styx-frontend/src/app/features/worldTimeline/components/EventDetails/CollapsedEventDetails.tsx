import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'

import { useCurrentOrNewEvent } from '../../hooks/useCurrentOrNewEvent'

type Props = {
	onClick: () => void
}

export const CollapsedEventDetails = ({ onClick }: Props) => {
	const { event } = useCurrentOrNewEvent()

	return (
		<Stack direction="row" justifyContent="flex-end">
			<Button
				color="secondary"
				sx={{
					minWidth: 140,
					maxWidth: '100px',
					background: 'rgba(0, 0, 0, 50%)',
					borderRadius: '0 0 16px 16px',
				}}
				onClick={onClick}
			>
				{event.name ? 'Edit event' : 'Create event'}
			</Button>
		</Stack>
	)
}
