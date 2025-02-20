import { memo } from 'react'
import { useSelector } from 'react-redux'
import { Virtuoso } from 'react-virtuoso'

import { OutlinedContainer } from '@/app/components/OutlinedContainer'
import { getWorldState } from '@/app/features/world/selectors'
import { useOutlinerTabs } from '@/app/features/worldTimeline/hooks/useOutlinerTabs'

import { useVisibleActors } from '../EventSelector/useVisibleActors'
import { useVisibleEvents } from '../EventSelector/useVisibleEvents'
import { StatementsScroller } from '../Outliner/styles'
import { OutlinerEmptyState } from './OutlinerEmptyState/OutlinerEmptyState'
import { WorldStateItem } from './WorldStateItem'

export const WorldState = memo(WorldStateComponent)

export function WorldStateComponent() {
	const { selectedTime, search } = useSelector(
		getWorldState,
		(a, b) => a.selectedTime === b.selectedTime && a.search === b.search,
	)

	const allVisibleActors = useVisibleActors()

	const { actorsVisible, eventsVisible, revokedVisible } = useOutlinerTabs()

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
		<OutlinedContainer label="World state" fullHeight style={{ pointerEvents: 'auto' }}>
			<StatementsScroller>
				{scrollerVisible && (
					<Virtuoso
						style={{ height: '100%' }}
						totalCount={totalCount}
						itemContent={(rawIndex) => {
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
							return <WorldStateItem index={rawIndex} actor={actor} event={event} />
						}}
					/>
				)}
				{!scrollerVisible && <OutlinerEmptyState />}
			</StatementsScroller>
		</OutlinedContainer>
	)
}
