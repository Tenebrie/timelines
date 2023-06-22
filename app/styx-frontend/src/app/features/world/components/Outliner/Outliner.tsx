import { Collapse, Container, Grid, List } from '@mui/material'
import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { TransitionGroup } from 'react-transition-group'

import { OverlayingLabel } from '../../../../components/OverlayingLabel'
import { getOutlinerPreferences } from '../../../preferences/selectors'
import { useTimelineLevelScalar } from '../../../time/hooks/useTimelineLevelScalar'
import { useWorldTime } from '../../../time/hooks/useWorldTime'
import { useWorldRouter } from '../../router'
import { getTimelineState, getWorldState } from '../../selectors'
import { IssuedStatementWizard } from '../IssuedStatementWizard/IssuedStatementWizard'
import { ActorWithStatementsRenderer } from '../Renderers/ActorWithStatementsRenderer'
import { EventWithStatementsRenderer } from '../Renderers/EventWithStatementsRenderer'
import { EventTutorialModal } from './components/EventTutorialModal/EventTutorialModal'
import { OutlinerControls } from './components/OutlinerControls/OutlinerControls'
import { OutlinerEmptyState } from './components/OutlinerEmptyState/OutlinerEmptyState'
import { OutlinerContainer, StatementsScroller, StatementsUnit } from './styles'

export const Outliner = () => {
	const { actors, events } = useSelector(getWorldState)
	const { scaleLevel } = useSelector(getTimelineState)
	const { showEmptyEvents, showInactiveStatements, collapsedActors, collapsedEvents } =
		useSelector(getOutlinerPreferences)
	const { timeToLabel } = useWorldTime()

	const { getLevelScalar } = useTimelineLevelScalar()

	const { selectedTime } = useWorldRouter()

	// All issued statements up to this point in timeline
	const issuedStatements = useMemo(
		() =>
			events
				.filter((event) => event.timestamp <= selectedTime)
				.flatMap((event) =>
					event.issuedStatements.map((statement, index) => ({
						...statement,
						timestamp: event.timestamp,
						index,
					}))
				),
		[events, selectedTime]
	)

	// All revoked statements up to this point in timeline
	const revokedStatements = useMemo(
		() =>
			events.filter((event) => event.timestamp <= selectedTime).flatMap((event) => event.revokedStatements),
		[events, selectedTime]
	)

	// All non-revoked statements up to this point in timeline
	const activeStatements = issuedStatements.filter(
		(issuedCard) => !revokedStatements.some((revokedCard) => issuedCard.id === revokedCard.id)
	)

	// Sorted list of all events visible at this point in outliner
	const highlightWithin = 10 * getLevelScalar(scaleLevel)
	const visibleEvents = useMemo(
		() =>
			events
				.filter((event) => event.timestamp <= selectedTime)
				.map((event, index) => ({
					...event,
					index,
					secondary: timeToLabel(event.timestamp),
					highlighted: Math.abs(event.timestamp - selectedTime) < highlightWithin,
					collapsed: collapsedEvents.includes(event.id),
					issuedStatements: event.issuedStatements
						.map((statement) => ({
							...statement,
							active: activeStatements.some((card) => card.id === statement.id),
						}))
						.filter((statement) => showInactiveStatements || statement.active),
				}))
				.filter(
					(event) =>
						showEmptyEvents ||
						event.issuedStatements.some((statement) => statement.active) ||
						(event.issuedStatements.length > 0 && showInactiveStatements) ||
						event.highlighted
				)
				.sort((a, b) => b.timestamp - a.timestamp || b.index - a.index),
		[
			activeStatements,
			events,
			highlightWithin,
			collapsedEvents,
			selectedTime,
			showEmptyEvents,
			showInactiveStatements,
			timeToLabel,
		]
	)

	const visibleActors = useMemo(
		() =>
			actors.map((actor) => ({
				...actor,
				highlighted: false,
				collapsed: collapsedActors.includes(actor.id),
				statements: actor.statements
					.map((statement) => ({
						...statement,
						active: activeStatements.some((card) => card.id === statement.id),
					}))
					.filter((statement) => showInactiveStatements || statement.active),
			})),
		[activeStatements, actors, collapsedActors, showInactiveStatements]
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
												<EventWithStatementsRenderer
													{...event}
													event={event}
													divider={index !== visibleEvents.length - 1}
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
			<IssuedStatementWizard />
			<EventTutorialModal />
		</Container>
	)
}
