import Clear from '@mui/icons-material/Clear'
import Search from '@mui/icons-material/Search'
import SubdirectoryArrowRight from '@mui/icons-material/SubdirectoryArrowRight'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import Paper from '@mui/material/Paper'
import TextField from '@mui/material/TextField'
import { Profiler, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { EventIcon } from '@/app/components/EventIcon'
import { useModal } from '@/app/features/modals/reducer'
import { preferencesSlice } from '@/app/features/preferences/reducer'
import { getOverviewPreferences } from '@/app/features/preferences/selectors'
import { reportComponentProfile } from '@/app/features/profiling/reportComponentProfile'
import { useWorldTime } from '@/app/features/time/hooks/useWorldTime'
import { isMultiselectClick } from '@/app/utils/isMultiselectClick'
import { useDoubleClick } from '@/hooks/useDoubleClick'
import { useWorldTimelineRouter } from '@/router/routes/worldTimelineRoutes'

import { ActorAvatar } from '../../worldTimeline/components/Renderers/ActorAvatar/ActorAvatar'
import { useTimelineBusDispatch } from '../../worldTimeline/hooks/useTimelineBus'
import { worldSlice } from '../../worldTimeline/reducer'
import { getWorldState } from '../../worldTimeline/selectors'
import { Actor, ActorDetails, WorldEvent, WorldEventDelta } from '../../worldTimeline/types'
import { OverviewSublist } from './OverviewSublist'
import { StyledListItemButton, StyledListItemText } from './styles'

export const OverviewPanel = () => {
	const [searchQuery, setSearchQuery] = useState<string>('')

	const { actors, events, selectedActors, selectedEvents } = useSelector(getWorldState, (a, b) => {
		return (
			a.actors === b.actors &&
			a.events === b.events &&
			a.selectedActors === b.selectedActors &&
			a.selectedEvents === b.selectedEvents
		)
	})
	const { actorsOpen, actorsReversed, eventsOpen, eventsReversed } = useSelector(getOverviewPreferences)

	const scrollTimelineTo = useTimelineBusDispatch()
	const { navigateToEventEditor, navigateToEventDeltaEditor, navigateToActorEditor } =
		useWorldTimelineRouter()
	const { timeToLabel } = useWorldTime()
	const { addActorToSelection, removeActorFromSelection, addEventToSelection, removeEventFromSelection } =
		worldSlice.actions
	const { open: openActorWizard } = useModal('actorWizard')
	const { open: openEventWizard } = useModal('eventWizard')
	const { setActorsOpen, setActorsReversed, setEventsOpen, setEventsReversed } = preferencesSlice.actions
	const dispatch = useDispatch()

	const sortedEvents = [...events]
		.sort((a, b) => a.timestamp - b.timestamp)
		.map((event) => ({
			...event,
			secondary: timeToLabel(event.timestamp),
		}))

	const renderActor = (actor: ActorDetails) => (
		<ListItem key={actor.id} disablePadding role="listitem">
			<StyledListItemButton
				divider={
					(!actorsReversed && actors.indexOf(actor) !== actors.length - 1) ||
					(actorsReversed && actors.indexOf(actor) !== 0)
				}
				onClick={(clickEvent) =>
					moveToActor(clickEvent, { actor, multiselect: isMultiselectClick(clickEvent) })
				}
				selected={selectedActors.includes(actor.id)}
			>
				<ListItemIcon>
					<ActorAvatar actor={actor} />
				</ListItemIcon>
				<StyledListItemText data-hj-suppress primary={actor.name} secondary={actor.title ?? 'No title'} />
			</StyledListItemButton>
		</ListItem>
	)

	const renderEvent = (event: WorldEvent & { secondary: string }) => [
		<ListItem key={event.id} disablePadding role="listitem">
			<StyledListItemButton
				divider={
					(!eventsReversed && sortedEvents.indexOf(event) !== sortedEvents.length - 1) ||
					(eventsReversed && sortedEvents.indexOf(event) !== 0) ||
					event.deltaStates.length > 0
				}
				onClick={(clickEvent) =>
					moveToEvent(clickEvent, { event, multiselect: isMultiselectClick(clickEvent) })
				}
				selected={selectedEvents.includes(event.id)}
			>
				<ListItemIcon>
					<EventIcon name={event.icon} height={24} />
				</ListItemIcon>
				<StyledListItemText data-hj-suppress primary={event.name} secondary={event.secondary} />
			</StyledListItemButton>
		</ListItem>,
		...event.deltaStates.map((delta, deltaIndex) => (
			<ListItem key={delta.id} disablePadding role="listitem" sx={{ paddingLeft: 2 }}>
				<StyledListItemButton
					divider={
						(!eventsReversed && sortedEvents.indexOf(event) !== sortedEvents.length - 1) ||
						(eventsReversed && sortedEvents.indexOf(event) !== 0) ||
						deltaIndex < event.deltaStates.length - 1
					}
					onClick={(clickEvent) =>
						moveToEventDelta(clickEvent, { delta, multiselect: isMultiselectClick(clickEvent) })
					}
					selected={selectedEvents.includes(event.id)}
				>
					<ListItemIcon>
						<SubdirectoryArrowRight />
					</ListItemIcon>
					<StyledListItemText
						data-hj-suppress
						primary={delta.name}
						secondary={timeToLabel(delta.timestamp)}
					/>
				</StyledListItemButton>
			</ListItem>
		)),
	]

	const { triggerClick: moveToActor } = useDoubleClick<{ actor: Actor; multiselect: boolean }>({
		onClick: ({ actor, multiselect }) => {
			if (selectedActors.includes(actor.id)) {
				dispatch(removeActorFromSelection(actor.id))
			} else {
				dispatch(addActorToSelection({ id: actor.id, multiselect }))
			}
		},
		onDoubleClick: ({ actor }) => {
			navigateToActorEditor(actor.id)
			dispatch(removeActorFromSelection(actor.id))
		},
		ignoreDelay: true,
	})

	const { triggerClick: moveToEvent } = useDoubleClick<{ event: WorldEvent; multiselect: boolean }>({
		onClick: ({ event, multiselect }) => {
			if (selectedEvents.includes(event.id)) {
				dispatch(removeEventFromSelection(event.id))
			} else {
				dispatch(addEventToSelection({ id: event.id, multiselect }))
			}
		},
		onDoubleClick: ({ event }) => {
			navigateToEventEditor({ eventId: event.id, selectedTime: event.timestamp })
		},
		ignoreDelay: true,
	})

	const { triggerClick: moveToEventDelta } = useDoubleClick<{ delta: WorldEventDelta; multiselect: boolean }>(
		{
			onClick: ({ delta, multiselect }) => {
				if (selectedEvents.includes(delta.id)) {
					dispatch(removeEventFromSelection(delta.worldEventId))
				} else {
					dispatch(addEventToSelection({ id: delta.worldEventId, multiselect }))
				}
			},
			onDoubleClick: ({ delta }) => {
				navigateToEventDeltaEditor({ eventId: delta.worldEventId, deltaId: delta.id })
				scrollTimelineTo(delta.timestamp)
				dispatch(removeEventFromSelection(delta.worldEventId))
			},
			ignoreDelay: true,
		},
	)

	const lowerCaseSearchQuery = searchQuery.toLowerCase()
	const displayedActors = actors.filter(
		(entity) =>
			entity.name.toLowerCase().includes(lowerCaseSearchQuery) ||
			entity.title.toLowerCase().includes(lowerCaseSearchQuery) ||
			entity.description.toLowerCase().includes(lowerCaseSearchQuery),
	)

	const displayedEvents = sortedEvents.filter(
		(entity) =>
			searchQuery.length <= 2 ||
			entity.name.toLowerCase().includes(lowerCaseSearchQuery) ||
			entity.description.toLowerCase().includes(lowerCaseSearchQuery) ||
			entity.secondary.toLowerCase().includes(lowerCaseSearchQuery),
	)

	return (
		<Profiler id="OverviewPanel" onRender={reportComponentProfile}>
			<Paper
				style={{
					width: 'calc(100% - 16px)',
					maxWidth: 1000,
					height: '100%',
					padding: '8px',
					boxSizing: 'border-box',
					overflowX: 'hidden',
					overflowY: 'scroll',
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
				<List dense sx={{ height: '100%' }}>
					<OverviewSublist
						title={`Actors (${displayedActors.length}/${actors.length})`}
						entities={displayedActors}
						open={actorsOpen}
						reversed={actorsReversed}
						onAddNew={() => openActorWizard({})}
						onToggleOpen={(val) => dispatch(setActorsOpen(val))}
						onToggleReversed={(val) => dispatch(setActorsReversed(val))}
						renderEntity={renderActor}
						entityName="actor"
					/>
					<OverviewSublist
						title={`Events (${displayedEvents.length}/${events.length})`}
						entities={displayedEvents}
						open={eventsOpen}
						reversed={eventsReversed}
						onToggleOpen={(val) => dispatch(setEventsOpen(val))}
						onToggleReversed={(val) => dispatch(setEventsReversed(val))}
						renderEntity={renderEvent}
						entityName="event"
					/>
				</List>
			</Paper>
		</Profiler>
	)
}
