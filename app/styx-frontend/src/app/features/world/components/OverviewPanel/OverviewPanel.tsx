import { Divider, List, ListItemIcon } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'

import { preferencesSlice } from '../../../preferences/reducer'
import { getOverviewPreferences } from '../../../preferences/selectors'
import { useWorldTime } from '../../../time/hooks/useWorldTime'
import { useEventIcons } from '../../hooks/useEventIcons'
import { useWorldRouter } from '../../router'
import { getWorldState } from '../../selectors'
import { WorldEvent, WorldStatement } from '../../types'
import { OverviewSublist } from './OverviewSublist'
import { StyledListItemButton, StyledListItemText } from './styles'

export const OverviewPanel = () => {
	const { events } = useSelector(getWorldState)
	const { panelOpen, eventsOpen, eventsReversed, statementsOpen, statementsReversed } =
		useSelector(getOverviewPreferences)

	const { eventEditorParams, statementEditorParams, navigateToEventEditor, navigateToStatementEditor } =
		useWorldRouter()
	const { timeToLabel } = useWorldTime()
	const { getIconPath } = useEventIcons()
	const { setEventsOpen, setEventsReversed, setStatementsOpen, setStatementsReversed } =
		preferencesSlice.actions
	const dispatch = useDispatch()

	const sortedEvents = [...events].sort((a, b) => a.timestamp - b.timestamp)
	const statements = sortedEvents.flatMap((event) => event.issuedStatements)

	const eventIdToName = (eventId: string) => events.find((event) => event.id === eventId)?.name ?? 'Unknown'
	const eventIdToTimeLabel = (eventId: string) =>
		timeToLabel(events.find((event) => event.id === eventId)?.timestamp ?? 0)

	const renderEvent = (event: WorldEvent) => (
		<StyledListItemButton
			onClick={() => navigateToEventEditor(event.id)}
			selected={eventEditorParams.eventId === event.id}
		>
			<ListItemIcon>
				<img src={getIconPath(event.icon)} height="24px" alt={`${event.icon} icon`} />
			</ListItemIcon>
			<StyledListItemText data-hj-suppress primary={event.name} secondary={timeToLabel(event.timestamp)} />
		</StyledListItemButton>
	)

	const renderStatement = (statement: WorldStatement) => (
		<StyledListItemButton
			onClick={() => navigateToStatementEditor(statement.id)}
			selected={statementEditorParams.statementId === statement.id}
		>
			<StyledListItemText
				data-hj-suppress
				primary={statement.title}
				secondary={`${eventIdToName(statement.issuedByEventId)} @ ${eventIdToTimeLabel(
					statement.issuedByEventId
				)}`}
			></StyledListItemText>
		</StyledListItemButton>
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
				gap: '16px',
			}}
		>
			<List dense>
				<OverviewSublist
					title="Events"
					entities={sortedEvents}
					open={eventsOpen}
					reversed={eventsReversed}
					onToggleOpen={(val) => dispatch(setEventsOpen(val))}
					onToggleReversed={(val) => dispatch(setEventsReversed(val))}
					renderEntity={renderEvent}
				/>
				<Divider />
				<OverviewSublist
					title="Statements"
					entities={statements}
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
