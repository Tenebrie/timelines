import { Link, Typography } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'

import { worldSlice } from '../../../../reducer'
import { getWorldState } from '../../../../selectors'

type Props = {
	selectedActors: string[]
	selectedEvents: string[]
}

export const OutlinerControlsFilter = ({ selectedActors, selectedEvents }: Props) => {
	const { actors, events } = useSelector(getWorldState)

	const dispatch = useDispatch()
	const { clearSelections } = worldSlice.actions

	const onClearFilters = () => {
		dispatch(clearSelections())
	}

	const actorsString =
		selectedActors.length === 0 || selectedActors.length === actors.length ? (
			<span>
				<b>all</b> actors
			</span>
		) : (
			<span>
				<b>{selectedActors.length}</b>/<b>{actors.length}</b> actors
			</span>
		)

	const eventsString =
		selectedEvents.length === 0 || selectedEvents.length === events.length ? (
			<span>
				<b>all</b> events
			</span>
		) : (
			<span>
				<b>{selectedEvents.length}</b>/<b>{events.length}</b> events
			</span>
		)

	return (
		<Typography variant="body2">
			Showing {actorsString} and {eventsString}.{' '}
			<Link href="#" onClick={() => onClearFilters()}>
				Click here to clear filters.
			</Link>
		</Typography>
	)
}
