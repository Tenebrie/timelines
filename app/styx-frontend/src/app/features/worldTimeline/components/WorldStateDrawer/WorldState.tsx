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
							// if (index === 0) {
							// 	return (
							// 		<Stack>
							// 			<Stack
							// 				direction="row"
							// 				justifyContent="space-between"
							// 				alignItems="center"
							// 				sx={{ margin: '1px' }}
							// 			>
							// 				<Tabs value={currentTab} onChange={(_, val) => setCurrentTab(val)}>
							// 					<Tab label="All" />
							// 					<Tab label="Actors" />
							// 					<Tab label="Events" />
							// 					{/* <Tab label="Simplified" /> */}
							// 				</Tabs>
							// 				<OutlinerSearch />
							// 			</Stack>
							// 			<ContainedSpinner visible={search.isLoading} />
							// 			{search.query &&
							// 				!search.isLoading &&
							// 				search.results.actors.length === 0 &&
							// 				search.results.events.length === 0 && <SearchEmptyState />}
							// 		</Stack>
							// 	)
							// }

							// const actorIndex = index - 1
							// if (actorIndex < renderedActors.length) {
							// 	const actor = renderedActors[actorIndex]
							// 	return (
							// 		<ActorWithStatementsRenderer
							// 			{...actor}
							// 			key={actor.id}
							// 			actor={actor}
							// 			divider={
							// 				(eventsVisible && renderedEvents.length > 0) || actorIndex !== renderedActors.length - 1
							// 			}
							// 		/>
							// 	)
							// }

							// const eventIndex = actorIndex - renderedActors.length
							// if (eventIndex < renderedEvents.length) {
							// 	const event = renderedEvents[eventIndex]
							// 	return (
							// 		<EventWithContentRenderer
							// 			{...event}
							// 			key={event.id}
							// 			event={event}
							// 			owningActor={null}
							// 			short={false}
							// 			divider={eventIndex !== renderedEvents.length - 1}
							// 			actions={eventActions}
							// 		/>
							// 	)
							// }
						}}
					/>
				)}
				{!scrollerVisible && <OutlinerEmptyState />}
			</StatementsScroller>
		</OutlinedContainer>
	)
}
