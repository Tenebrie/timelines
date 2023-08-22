import { Container, Tab, Tabs } from '@mui/material'
import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { Virtuoso } from 'react-virtuoso'

import { OverlayingLabel } from '../../../../components/OverlayingLabel'
import { getOutlinerPreferences } from '../../../preferences/selectors'
import { useTimelineLevelScalar } from '../../../time/hooks/useTimelineLevelScalar'
import { useOutlinerTabs } from '../../hooks/useOutlinerTabs'
import { useWorldRouter } from '../../router'
import { getTimelineState, getWorldState } from '../../selectors'
import { ActorWithStatementsRenderer } from '../Renderers/ActorWithStatementsRenderer'
import { EventWithContentRenderer } from '../Renderers/Event/EventWithContentRenderer'
import { EventTutorialModal } from './components/EventTutorialModal/EventTutorialModal'
import { OutlinerControls } from './components/OutlinerControls/OutlinerControls'
import { OutlinerEmptyState } from './components/OutlinerEmptyState/OutlinerEmptyState'
import { OutlinerContainer, StatementsScroller, StatementsUnit } from './styles'

export const Outliner = () => {
	const { actors, events, selectedActors, selectedEvents } = useSelector(getWorldState)
	const { scaleLevel } = useSelector(getTimelineState)
	const { showInactiveStatements, collapsedActors, collapsedEvents } = useSelector(getOutlinerPreferences)

	const { getLevelScalar } = useTimelineLevelScalar()

	const { selectedTimeOrNull } = useWorldRouter()
	const selectedTime = selectedTimeOrNull === null ? Infinity : selectedTimeOrNull

	// Sorted list of all events visible at this point in outliner
	const highlightWithin = 10 * getLevelScalar(scaleLevel)
	const visibleEvents = useMemo(
		() =>
			events
				.filter((event) => event.timestamp <= selectedTime || selectedEvents.includes(event.id))
				.map((event, index) => ({
					...event,
					index,
					collapsed: collapsedEvents.includes(event.id),
					highlighted: Math.abs(event.timestamp - selectedTime) < highlightWithin,
					active: event.revokedAt === undefined || event.revokedAt > selectedTime,
				}))
				.filter((event) => showInactiveStatements || event.active)
				.sort((a, b) => a.timestamp - b.timestamp || a.index - b.index),
		[events, selectedTime, highlightWithin, showInactiveStatements, selectedEvents, collapsedEvents]
	)

	const visibleActors = useMemo(
		() =>
			actors.map((actor) => ({
				...actor,
				highlighted: false,
				collapsed: collapsedActors.includes(actor.id),
				events: visibleEvents.filter((event) => actor.statements.some((e) => e.id === event.id)),
			})),
		[actors, collapsedActors, visibleEvents]
	)

	const eventActions = useMemo<('edit' | 'collapse')[]>(() => ['edit', 'collapse'], [])
	const { currentTab, setCurrentTab, actorsVisible, eventsVisible } = useOutlinerTabs()

	const renderedActors = actorsVisible ? visibleActors : []
	const renderedEvents = eventsVisible ? visibleEvents : []
	const scrollerVisible = visibleActors.length > 0 || visibleEvents.length > 0

	return (
		<Container maxWidth="lg" style={{ height: '100%' }}>
			<OutlinerContainer>
				<OutlinerControls />
				<StatementsUnit>
					<OverlayingLabel>World state</OverlayingLabel>
					<StatementsScroller>
						{scrollerVisible && (
							<Virtuoso
								style={{ height: '100%' }}
								totalCount={renderedActors.length + renderedEvents.length + 1}
								itemContent={(index) => {
									if (index === 0) {
										return (
											<Tabs value={currentTab} onChange={(_, val) => setCurrentTab(val)}>
												<Tab label="All" />
												<Tab label="Actors" />
												<Tab label="Events" />
											</Tabs>
										)
									}

									const actorIndex = index - 1
									if (actorIndex < renderedActors.length) {
										const actor = renderedActors[actorIndex]
										return (
											<ActorWithStatementsRenderer
												{...actor}
												actor={actor}
												divider={
													(eventsVisible && renderedEvents.length > 0) ||
													actorIndex !== renderedActors.length - 1
												}
											/>
										)
									}

									const eventIndex = actorIndex - renderedActors.length
									if (eventIndex < renderedEvents.length) {
										const event = renderedEvents[eventIndex]
										return (
											<EventWithContentRenderer
												{...event}
												event={event}
												owningActor={null}
												short={false}
												divider={eventIndex !== renderedEvents.length - 1}
												actions={eventActions}
											/>
										)
									}
								}}
							/>
						)}
						{!scrollerVisible && <OutlinerEmptyState selectedTime={selectedTime} />}
					</StatementsScroller>
				</StatementsUnit>
			</OutlinerContainer>
			<EventTutorialModal />
		</Container>
	)
}
