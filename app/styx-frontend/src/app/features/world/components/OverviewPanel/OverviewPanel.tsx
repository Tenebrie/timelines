import { Clear, Search, SubdirectoryArrowRight } from '@mui/icons-material'
import { IconButton, InputAdornment, List, ListItem, ListItemIcon, TextField } from '@mui/material'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { useDoubleClick } from '../../../../../hooks/useDoubleClick'
import { EventIcon } from '../../../../components/EventIcon'
import { isMultiselectClick } from '../../../../utils/isMultiselectClick'
import { preferencesSlice } from '../../../preferences/reducer'
import { getOverviewPreferences } from '../../../preferences/selectors'
import { useWorldTime } from '../../../time/hooks/useWorldTime'
import { useEventIcons } from '../../hooks/useEventIcons'
import { worldSlice } from '../../reducer'
import { useWorldRouter } from '../../router'
import { getWorldState } from '../../selectors'
import { Actor, ActorDetails, WorldEvent } from '../../types'
import { ActorAvatar } from '../Renderers/ActorAvatar/ActorAvatar'
import { OverviewSublist } from './OverviewSublist'
import { StyledListItemButton, StyledListItemText } from './styles'

export const OverviewPanel = () => {
	const [searchQuery, setSearchQuery] = useState<string>('')

	const { actors, events, selectedActors, selectedEvents } = useSelector(getWorldState)
	const { panelOpen, actorsOpen, actorsReversed, eventsOpen, eventsReversed } =
		useSelector(getOverviewPreferences)

	const { navigateToActorEditor, navigateToEventEditor } = useWorldRouter()
	const { timeToLabel } = useWorldTime()
	const { getIconPath } = useEventIcons()
	const {
		openActorWizard,
		openEventWizard,
		addActorToSelection,
		removeActorFromSelection,
		addEventToSelection,
		removeEventFromSelection,
	} = worldSlice.actions
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
						moveToEvent(clickEvent, { event, multiselect: isMultiselectClick(clickEvent) })
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
			navigateToEventEditor(event.id)
			dispatch(removeEventFromSelection(event.id))
		},
		ignoreDelay: true,
	})

	const lowerCaseSearchQuery = searchQuery.toLowerCase()
	const displayedActors = actors.filter(
		(entity) =>
			entity.name.toLowerCase().includes(lowerCaseSearchQuery) ||
			entity.title.toLowerCase().includes(lowerCaseSearchQuery) ||
			entity.description.toLowerCase().includes(lowerCaseSearchQuery)
	)

	const displayedEvents = sortedEvents.filter(
		(entity) =>
			searchQuery.length <= 2 ||
			entity.name.toLowerCase().includes(lowerCaseSearchQuery) ||
			entity.description.toLowerCase().includes(lowerCaseSearchQuery) ||
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
					title={`Actors (${displayedActors.length}/${actors.length})`}
					entities={displayedActors}
					open={actorsOpen}
					reversed={actorsReversed}
					onAddNew={() => dispatch(openActorWizard())}
					onToggleOpen={(val) => dispatch(setActorsOpen(val))}
					onToggleReversed={(val) => dispatch(setActorsReversed(val))}
					renderEntity={renderActor}
				/>
				<OverviewSublist
					title={`Events (${displayedEvents.length}/${events.length})`}
					entities={displayedEvents}
					open={eventsOpen}
					reversed={eventsReversed}
					onAddNew={() => dispatch(openEventWizard({ timestamp: 0 }))}
					onToggleOpen={(val) => dispatch(setEventsOpen(val))}
					onToggleReversed={(val) => dispatch(setEventsReversed(val))}
					renderEntity={renderEvent}
				/>
			</List>
		</div>
	)
}
