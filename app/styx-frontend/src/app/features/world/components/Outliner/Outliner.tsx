import { Link } from '@mui/icons-material'
import { Collapse, Container, Divider, Grid, List, ListItemIcon, ListItemText } from '@mui/material'
import { useSelector } from 'react-redux'
import { TransitionGroup } from 'react-transition-group'

import { OverlayingLabel } from '../../../../components/OverlayingLabel'
import { TrunkatedTypography } from '../../../../components/TrunkatedTypography'
import { getOutlinerPreferences } from '../../../preferences/selectors'
import { useTimelineLevelScalar } from '../../../time/hooks/useTimelineLevelScalar'
import { useWorldTime } from '../../../time/hooks/useWorldTime'
import { useEventIcons } from '../../hooks/useEventIcons'
import { useWorldRouter } from '../../router'
import { getTimelineState, getWorldState } from '../../selectors'
import { ActorDetails, WorldEvent, WorldStatement } from '../../types'
import { EventTutorialModal } from './components/EventTutorialModal/EventTutorialModal'
import { OutlinerControls } from './components/OutlinerControls/OutlinerControls'
import { OutlinerEmptyState } from './components/OutlinerEmptyState/OutlinerEmptyState'
import {
	OutlinerContainer,
	StatementActorsText,
	StatementsScroller,
	StatementsUnit,
	StyledListItemButton,
	StyledListItemText,
	ZebraWrapper,
} from './styles'

export const Outliner = () => {
	const { actors, events } = useSelector(getWorldState)
	const { scaleLevel } = useSelector(getTimelineState)
	const { showEmptyEvents, showInactiveStatements } = useSelector(getOutlinerPreferences)
	const { timeToLabel } = useWorldTime()

	const { getLevelScalar } = useTimelineLevelScalar()

	const { outlinerParams, navigateToActorEditor, navigateToEventEditor, navigateToStatementEditor } =
		useWorldRouter()
	const selectedTime = Number(outlinerParams.timestamp)

	// All issued statements up to this point in timeline
	const issuedStatements = events
		.filter((event) => event.timestamp <= selectedTime)
		.flatMap((event) =>
			event.issuedStatements.map((statement, index) => ({
				...statement,
				timestamp: event.timestamp,
				index,
			}))
		)

	// All revoked statements up to this point in timeline
	const revokedStatements = events
		.filter((event) => event.timestamp <= selectedTime)
		.flatMap((event) => event.revokedStatements)

	// All non-revoked statements up to this point in timeline
	const activeStatements = issuedStatements.filter(
		(issuedCard) => !revokedStatements.some((revokedCard) => issuedCard.id === revokedCard.id)
	)

	// Sorted list of all events visible at this point in outliner
	const highlightWithin = 10 * getLevelScalar(scaleLevel)
	const visibleEvents = events
		.filter((event) => event.timestamp <= selectedTime)
		.map((event, index) => ({
			...event,
			index,
			secondary: timeToLabel(event.timestamp),
			highlighted: Math.abs(event.timestamp - selectedTime) < highlightWithin,
			statements: event.issuedStatements
				.map((statement) => ({
					...statement,
					active: activeStatements.some((card) => card.id === statement.id),
				}))
				.filter((statement) => showInactiveStatements || statement.active),
		}))
		.filter(
			(event) =>
				showEmptyEvents ||
				event.statements.some((statement) => statement.active) ||
				(event.statements.length > 0 && showInactiveStatements) ||
				event.highlighted
		)
		.sort((a, b) => b.timestamp - a.timestamp || b.index - a.index)

	const visibleActors = actors.map((actor) => ({
		...actor,
		highlighted: false,
		statements: actor.statements
			.map((statement) => ({
				...statement,
				active: activeStatements.some((card) => card.id === statement.id),
			}))
			.filter((statement) => showInactiveStatements || statement.active),
	}))

	const { getIconPath } = useEventIcons()

	const renderActor = (actor: ActorDetails & { highlighted: boolean }) => (
		<StyledListItemButton selected={actor.highlighted} onClick={() => navigateToActorEditor(actor.id)}>
			<StyledListItemText data-hj-suppress primary={actor.name} secondary={actor.title} />
		</StyledListItemButton>
	)

	const renderEvent = (event: WorldEvent & { highlighted: boolean; secondary: string }) => (
		<StyledListItemButton selected={event.highlighted} onClick={() => navigateToEventEditor(event.id)}>
			<ListItemIcon>
				<img src={getIconPath(event.icon)} height="24px" alt={`${event.icon} icon`} />
			</ListItemIcon>
			<StyledListItemText data-hj-suppress primary={event.name} secondary={event.secondary} />
		</StyledListItemButton>
	)

	const renderStatement = (
		statement: WorldStatement & { active: boolean },
		actor: ActorDetails | null,
		index: number
	) => {
		const maxActorsDisplayed = 4
		const linkedActors = (() => {
			const actors = statement.relatedActors.filter((a) => a.id !== actor?.id)
			if (actors.length === 0) {
				return ''
			} else if (actors.length <= maxActorsDisplayed) {
				return actors.map((actor) => actor.name).join(' | ')
			} else {
				return (
					actors
						.slice(0, maxActorsDisplayed - 1)
						.map((actor) => actor.name)
						.join(' | ') + ` | (and ${actors.length - maxActorsDisplayed + 1} more...)`
				)
			}
		})()
		const content = (
			<>
				{statement.title.length > 0 && <b>{statement.title}:</b>} {statement.content}
			</>
		)
		return (
			<ZebraWrapper zebra={index % 2 === 0}>
				<StyledListItemButton
					selected={false}
					sx={{ pl: 4 }}
					onClick={() => navigateToStatementEditor(statement.id)}
				>
					<ListItemText
						data-hj-suppress
						primary={<TrunkatedTypography lines={3}>{content}</TrunkatedTypography>}
						secondary={
							<TrunkatedTypography lines={3}>
								<StatementActorsText>
									{linkedActors.length > 0 ? <Link /> : ''} {linkedActors}
								</StatementActorsText>
							</TrunkatedTypography>
						}
						style={{ color: statement.active ? 'inherit' : 'gray' }}
					></ListItemText>
				</StyledListItemButton>
			</ZebraWrapper>
		)
	}

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
										{visibleActors.map((actor) => (
											<Collapse key={actor.id}>
												{renderActor(actor)}
												<List dense component="div" disablePadding>
													<TransitionGroup>
														{actor.statements.map((statement, index) => (
															<Collapse key={statement.id}>
																{renderStatement(statement, actor, index)}
															</Collapse>
														))}
													</TransitionGroup>
												</List>
												<Divider />
											</Collapse>
										))}
										{visibleEvents.map((event, index) => (
											<Collapse key={event.id}>
												{renderEvent(event)}
												<List dense component="div" disablePadding>
													<TransitionGroup>
														{event.statements.map((statement, index) => (
															<Collapse key={statement.id}>
																{renderStatement(statement, null, index)}
															</Collapse>
														))}
													</TransitionGroup>
												</List>
												{index !== visibleEvents.length - 1 && <Divider />}
											</Collapse>
										))}
									</TransitionGroup>
								</List>
								{visibleEvents.length === 0 && <OutlinerEmptyState selectedTime={selectedTime} />}
							</StatementsScroller>
						</StatementsUnit>
					</OutlinerContainer>
				</Grid>
			</Grid>
			<EventTutorialModal />
		</Container>
	)
}
