import Box from '@mui/material/Box'
import { memo } from 'react'
import { useSelector } from 'react-redux'
import { Virtuoso } from 'react-virtuoso'

import { OutlinedContainer } from '@/app/components/OutlinedContainer'
import { useOutlinerTabs } from '@/app/components/Outliner/hooks/useOutlinerTabs'
import { useBrowserSpecificScrollbars } from '@/app/hooks/useBrowserSpecificScrollbars'
import { getWorldState } from '@/app/views/world/WorldSliceSelectors'
import { useCheckRouteMatch } from '@/router-utils/hooks/useCheckRouteMatch'

import { CreateEntityButton } from './components/CreateEntityButton'
import { OutlinerEmptyState } from './components/OutlinerEmptyState'
import { useVisibleActors } from './hooks/useVisibleActors'
import { useVisibleEvents } from './hooks/useVisibleEvents'
import { OutlinerItem } from './items/OutlinerItem'

export const OutlinerContent = memo(OutlinerContentComponent)

export function OutlinerContentComponent() {
	const { selectedTime, search } = useSelector(
		getWorldState,
		(a, b) => a.selectedTime === b.selectedTime && a.search === b.search,
	)
	const eventsVisible = useCheckRouteMatch('/world/$worldId/timeline')
	const actorsVisible = useCheckRouteMatch('/world/$worldId/mindmap')

	const allVisibleActors = useVisibleActors()

	const { revokedVisible } = useOutlinerTabs()

	const allVisibleEvents = useVisibleEvents({
		timestamp: selectedTime,
		includeInactive: revokedVisible,
	})

	const totalCount = (() => {
		let total = 1
		if (actorsVisible) {
			total += allVisibleActors.length
		}
		if (eventsVisible) {
			total += allVisibleEvents.length
		}
		return total
	})()
	const scrollerVisible = totalCount > 1 || !!search.query

	return (
		<OutlinedContainer
			label="Outliner"
			fullHeight
			style={{ pointerEvents: 'auto' }}
			secondaryLabel={<CreateEntityButton />}
		>
			<Box
				sx={{
					width: '100%',
					height: '100%',
					overflowY: 'auto',
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'center',
					'& > *': {
						flexGrow: 0,
						flexShrink: 0,
					},
					'& > [data-virtuoso-scroller]': {
						...useBrowserSpecificScrollbars(),
					},
				}}
			>
				<Virtuoso
					style={{ height: '100%', ...scrollbars }}
					totalCount={Math.max(2, totalCount)}
					itemContent={(rawIndex) => {
						if (!scrollerVisible && rawIndex === 1) {
							return <OutlinerEmptyState />
						}
						const actor = (() => {
							if (!actorsVisible) {
								return undefined
							}
							const index = rawIndex - 1
							return allVisibleActors[index]
						})()
						const event = (() => {
							if (!eventsVisible) {
								return undefined
							}
							const index = (() => {
								let acc = rawIndex - 1
								if (actorsVisible) {
									acc -= allVisibleActors.length
								}
								return acc
							})()
							return allVisibleEvents[index]
						})()
						return <OutlinerItem index={rawIndex} actor={actor} event={event} />
					}}
				/>
			</Box>
		</OutlinedContainer>
	)
}
