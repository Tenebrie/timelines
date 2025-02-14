import Button from '@mui/material/Button'

import { useCurrentOrNewEvent } from '../../hooks/useCurrentOrNewEvent'

type Props = {
	onClick: () => void
}

export const CollapsedEventDetails = ({ onClick }: Props) => {
	const { event } = useCurrentOrNewEvent()

	return <Button onClick={onClick}>{event.name || 'Create event'}</Button>
}
