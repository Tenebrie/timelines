import { ListItemText, MenuItem } from '@mui/material'
import { useMemo } from 'react'

import { WorldEvent } from '../../types'
import { useMapEventsToOptions } from './useMapEventsToOptions'
import { useVisibleEvents } from './useVisibleEvents'

type Props = {
	timestamp: number
	excludedEvents?: WorldEvent[]
}

export const useAutocompleteEventList = ({ timestamp, excludedEvents }: Props) => {
	const visibleEvents = useVisibleEvents({ timestamp, excludedEvents })
	const { mapEventsToOptions } = useMapEventsToOptions()

	const eventOptions = useMemo(() => mapEventsToOptions(visibleEvents), [mapEventsToOptions, visibleEvents])

	const renderOption = (props: any, option: Pick<WorldEvent, 'id' | 'name'>) => (
		<MenuItem key={option.id} {...props}>
			<ListItemText primary={option.name} />
		</MenuItem>
	)

	return {
		eventOptions,
		renderOption,
	}
}
