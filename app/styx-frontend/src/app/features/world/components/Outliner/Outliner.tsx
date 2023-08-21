import { Collapse, Container, Grid, List } from '@mui/material'
import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { TransitionGroup } from 'react-transition-group'

import { OverlayingLabel } from '../../../../components/OverlayingLabel'
import { getOutlinerPreferences } from '../../../preferences/selectors'
import { useTimelineLevelScalar } from '../../../time/hooks/useTimelineLevelScalar'
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
	const { showOnlySelected, showInactiveStatements, collapsedActors } = useSelector(getOutlinerPreferences)

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
					highlighted: Math.abs(event.timestamp - selectedTime) < highlightWithin,
					active: event.revokedAt === undefined || event.revokedAt > selectedTime,
				}))
				.filter((event) => showInactiveStatements || event.active)
				.filter(
					(event) => !showOnlySelected || selectedEvents.length === 0 || selectedEvents.includes(event.id)
				)
				.sort((a, b) => b.timestamp - a.timestamp || b.index - a.index),
		[events, showOnlySelected, selectedTime, highlightWithin, showInactiveStatements, selectedEvents]
	)

	const visibleActors = useMemo(
		() =>
			actors
				.map((actor) => ({
					...actor,
					highlighted: false,
					collapsed: collapsedActors.includes(actor.id),
					events: visibleEvents.filter((event) => actor.statements.some((e) => e.id === event.id)),
				}))
				.filter(
					(actor) => !showOnlySelected || selectedActors.length === 0 || selectedActors.includes(actor.id)
				),
		[actors, collapsedActors, visibleEvents, showOnlySelected, selectedActors]
	)

	return (
		<Container maxWidth="lg" style={{ height: '100%' }}>
			<Grid container padding={2} columns={{ xs: 12, sm: 12, md: 12 }} height="100%" direction="column">
				<Grid item xs={12} md={6} order={{ xs: 0, md: 1 }} height="100%">
					<OutlinerContainer>
						<OutlinerControls />
						<StatementsUnit>
							<OverlayingLabel>World state</OverlayingLabel>
							<StatementsScroller>
								<List disablePadding>
									<TransitionGroup>
										{visibleActors.map((actor, index) => (
											<Collapse key={actor.id}>
												<ActorWithStatementsRenderer
													{...actor}
													actor={actor}
													divider={visibleEvents.length > 0 || index !== visibleActors.length - 1}
												/>
											</Collapse>
										))}
										{visibleEvents.map((event, index) => (
											<Collapse key={event.id}>
												<EventWithContentRenderer
													{...event}
													event={event}
													owningActor={null}
													short={false}
													divider={index !== visibleEvents.length - 1}
													actions={['edit', 'collapse']}
												/>
											</Collapse>
										))}
									</TransitionGroup>
								</List>
								{visibleEvents.length === 0 && actors.length === 0 && (
									<OutlinerEmptyState selectedTime={selectedTime} />
								)}
							</StatementsScroller>
						</StatementsUnit>
					</OutlinerContainer>
				</Grid>
			</Grid>
			<EventTutorialModal />
		</Container>
	)
}
