import { Clear, Search } from '@mui/icons-material'
import { IconButton, InputAdornment, List, ListItemIcon, TextField } from '@mui/material'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { preferencesSlice } from '../../../preferences/reducer'
import { getOverviewPreferences } from '../../../preferences/selectors'
import { useWorldTime } from '../../../time/hooks/useWorldTime'
import { useEventIcons } from '../../hooks/useEventIcons'
import { worldSlice } from '../../reducer'
import { useWorldRouter } from '../../router'
import { getWorldState } from '../../selectors'
import { Actor, WorldEvent, WorldStatement } from '../../types'
import { OverviewSublist } from './OverviewSublist'
import { StyledListItemButton, StyledListItemText } from './styles'

export const OverviewPanel = () => {
	const [searchQuery, setSearchQuery] = useState<string>('')
	const [lastClickTimestamp, setLastClickTimestamp] = useState<number>(0)

	const { actors, events } = useSelector(getWorldState)
	const {
		panelOpen,
		actorsOpen,
		actorsReversed,
		eventsOpen,
		eventsReversed,
		statementsOpen,
		statementsReversed,
	} = useSelector(getOverviewPreferences)

	const {
		actorEditorParams,
		eventEditorParams,
		statementEditorParams,
		navigateToOutliner,
		navigateToActorEditor,
		navigateToEventEditor,
		navigateToStatementEditor,
	} = useWorldRouter()
	const { timeToLabel } = useWorldTime()
	const { getIconPath } = useEventIcons()
	const { openActorWizard, openEventWizard } = worldSlice.actions
	const {
		setActorsOpen,
		setActorsReversed,
		setEventsOpen,
		setEventsReversed,
		setStatementsOpen,
		setStatementsReversed,
	} = preferencesSlice.actions
	const dispatch = useDispatch()

	const eventIdToName = (eventId: string) => events.find((event) => event.id === eventId)?.name ?? 'Unknown'
	const eventIdToTimeLabel = (eventId: string) =>
		timeToLabel(events.find((event) => event.id === eventId)?.timestamp ?? 0)

	const sortedEvents = [...events]
		.sort((a, b) => a.timestamp - b.timestamp)
		.map((event) => ({
			...event,
			secondary: timeToLabel(event.timestamp),
		}))
	const statements = sortedEvents.flatMap((event) =>
		event.issuedStatements.map((statement) => ({
			...statement,
			secondary: `${eventIdToName(statement.issuedByEventId)} @ ${eventIdToTimeLabel(
				statement.issuedByEventId
			)}`,
		}))
	)

	const renderActor = (actor: Actor) => (
		<StyledListItemButton
			divider={
				(!actorsReversed && actors.indexOf(actor) !== actors.length - 1) ||
				(actorsReversed && actors.indexOf(actor) !== 0)
			}
			onClick={() => navigateToActorEditor(actor.id)}
			selected={actorEditorParams.actorId === actor.id}
		>
			<StyledListItemText data-hj-suppress primary={actor.name} secondary={actor.title ?? 'No title'} />
		</StyledListItemButton>
	)

	const renderEvent = (event: WorldEvent & { secondary: string }) => (
		<StyledListItemButton
			divider={
				(!eventsReversed && sortedEvents.indexOf(event) !== sortedEvents.length - 1) ||
				(eventsReversed && sortedEvents.indexOf(event) !== 0)
			}
			onClick={() => moveToEvent(event)}
			selected={eventEditorParams.eventId === event.id}
		>
			<ListItemIcon>
				<img src={getIconPath(event.icon)} height="24px" alt={`${event.icon} icon`} />
			</ListItemIcon>
			<StyledListItemText data-hj-suppress primary={event.name} secondary={event.secondary} />
		</StyledListItemButton>
	)

	const renderStatement = (statement: WorldStatement & { secondary: string }) => (
		<StyledListItemButton
			divider={
				(!statementsReversed && statements.indexOf(statement) !== statements.length - 1) ||
				(statementsReversed && statements.indexOf(statement) !== 0)
			}
			onClick={() => moveToStatement(statement)}
			selected={statementEditorParams.statementId === statement.id}
		>
			<StyledListItemText
				data-hj-suppress
				primary={statement.title}
				secondary={statement.secondary}
			></StyledListItemText>
		</StyledListItemButton>
	)

	const moveToEvent = (event: WorldEvent) => {
		const timestamp = Date.now()
		setLastClickTimestamp(timestamp)
		if (timestamp - lastClickTimestamp > 500) {
			navigateToOutliner(event.timestamp)
		} else {
			navigateToEventEditor(event.id)
		}
	}

	const moveToStatement = (statement: WorldStatement) => {
		const timestamp = Date.now()
		setLastClickTimestamp(timestamp)

		const parentEvent = events.find((event) => event.id === statement.issuedByEventId)
		if (!parentEvent) {
			return
		}

		if (timestamp - lastClickTimestamp > 500) {
			navigateToOutliner(parentEvent.timestamp)
		} else {
			navigateToStatementEditor(statement.id)
		}
	}

	const lowerCaseSearchQuery = searchQuery.toLowerCase()
	const displayedActors = actors.filter(
		(entity) =>
			entity.name.toLowerCase().includes(lowerCaseSearchQuery) ||
			entity.description.toLowerCase().includes(lowerCaseSearchQuery)
	)

	const displayedEvents = sortedEvents.filter(
		(entity) =>
			searchQuery.length <= 2 ||
			entity.name.toLowerCase().includes(lowerCaseSearchQuery) ||
			entity.description.toLowerCase().includes(lowerCaseSearchQuery) ||
			entity.secondary.toLowerCase().includes(lowerCaseSearchQuery)
	)

	const displayedStatements = statements.filter(
		(entity) =>
			searchQuery.length <= 2 ||
			entity.title.toLowerCase().includes(lowerCaseSearchQuery) ||
			entity.content.toLowerCase().includes(lowerCaseSearchQuery) ||
			entity.secondary.toLowerCase().includes(lowerCaseSearchQuery)
	)

	return (
		<div
			style={{
				padding: '8px',
				width: '384px',
				marginLeft: `${panelOpen ? 0 : -384}px`,
				height: '100%',
				boxSizing: 'border-box',
				background: 'rgba(0, 0, 255, 0.05)',
				overflowX: 'hidden',
				overflowY: 'scroll',
				transition: 'margin-left 0.3s',
				display: 'flex',
				flexDirection: 'column',
			}}
		>
			<TextField
				id="overview-search"
				value={searchQuery}
				onChange={(event) => setSearchQuery(event.target.value ?? null)}
				size="small"
				placeholder="Search..."
				InputProps={{
					startAdornment: (
						<InputAdornment position="start">
							<Search />
						</InputAdornment>
					),
					endAdornment: searchQuery && (
						<InputAdornment position="end">
							<IconButton
								onClick={() => {
									setSearchQuery('')
								}}
							>
								<Clear />
							</IconButton>
						</InputAdornment>
					),
				}}
			/>
			<List dense>
				<OverviewSublist
					title={`Actors (${displayedActors.length})`}
					entities={displayedActors}
					open={actorsOpen}
					reversed={actorsReversed}
					onAddNew={() => dispatch(openActorWizard())}
					onToggleOpen={(val) => dispatch(setActorsOpen(val))}
					onToggleReversed={(val) => dispatch(setActorsReversed(val))}
					renderEntity={renderActor}
				/>
				<OverviewSublist
					title={`Events (${displayedEvents.length})`}
					entities={displayedEvents}
					open={eventsOpen}
					reversed={eventsReversed}
					onAddNew={() => dispatch(openEventWizard({ timestamp: 0 }))}
					onToggleOpen={(val) => dispatch(setEventsOpen(val))}
					onToggleReversed={(val) => dispatch(setEventsReversed(val))}
					renderEntity={renderEvent}
				/>
				<OverviewSublist
					title={`Statements (${displayedStatements.length})`}
					entities={displayedStatements}
					open={statementsOpen}
					reversed={statementsReversed}
					onToggleOpen={(val) => dispatch(setStatementsOpen(val))}
					onToggleReversed={(val) => dispatch(setStatementsReversed(val))}
					renderEntity={renderStatement}
				/>
			</List>
		</div>
	)
}
