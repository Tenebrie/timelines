import { Grid, Stack, Tab, Tabs, useMediaQuery } from '@mui/material'
import { Profiler, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { Virtuoso } from 'react-virtuoso'

import { OutlinedContainer } from '@/app/components/OutlinedContainer'
import { getOutlinerPreferences, getTimelinePreferences } from '@/app/features/preferences/selectors'
import { reportComponentProfile } from '@/app/features/profiling/reportComponentProfile'
import { useTimelineLevelScalar } from '@/app/features/time/hooks/useTimelineLevelScalar'
import { useWorldTime } from '@/app/features/time/hooks/useWorldTime'
import { isNull } from '@/app/utils/isNull'
import { useCustomTheme } from '@/hooks/useCustomTheme'
import { useIsReadOnly } from '@/hooks/useIsReadOnly'

import { useOutlinerTabs } from '../../hooks/useOutlinerTabs'
import { getTimelineState, getWorldState } from '../../selectors'
import { EventCreator } from '../EventEditor/EventCreator'
import { useVisibleEvents } from '../EventSelector/useVisibleEvents'
import { ActorWithStatementsRenderer } from '../Renderers/ActorWithStatementsRenderer'
import { EventWithContentRenderer } from '../Renderers/Event/EventWithContentRenderer'
import { EventTutorialModal } from './components/EventTutorialModal/EventTutorialModal'
import { OutlinerControls } from './components/OutlinerControls/OutlinerControls'
import { OutlinerEmptyState } from './components/OutlinerEmptyState/OutlinerEmptyState'
import { StatementsScroller } from './styles'

export const Outliner = () => {
	const { actors, selectedTime } = useSelector(
		getWorldState,
		(a, b) => a.actors === b.actors && a.selectedTime === b.selectedTime,
	)
	const { scaleLevel } = useSelector(getTimelineState, (a, b) => a.scaleLevel === b.scaleLevel)
	const { lineSpacing } = useSelector(getTimelinePreferences, (a, b) => a.lineSpacing === b.lineSpacing)
	const { showInactiveStatements, expandedActors, expandedEvents } = useSelector(
		getOutlinerPreferences,
		(a, b) =>
			a.showInactiveStatements === b.showInactiveStatements &&
			a.expandedActors === b.expandedActors &&
			a.expandedEvents === b.expandedEvents,
	)

	const { getLevelScalar } = useTimelineLevelScalar()
	const { timeToLabel } = useWorldTime()
	const timeLabel = useMemo(() => timeToLabel(selectedTime), [selectedTime, timeToLabel])

	const { isReadOnly } = useIsReadOnly()

	// Sorted list of all events visible at this point in outliner
	const highlightWithin = lineSpacing * getLevelScalar(scaleLevel)

	const allVisibleEvents = useVisibleEvents({
		timestamp: selectedTime,
		includeInactive: showInactiveStatements,
	})

	const visibleEvents = useMemo(
		() =>
			allVisibleEvents
				.map((event, index) => ({
					...event,
					index,
					collapsed: !expandedEvents.includes(event.id),
					highlighted: Math.abs(event.timestamp - selectedTime) < highlightWithin,
					active: isNull(event.revokedAt) || event.revokedAt > selectedTime,
				}))
				.sort((a, b) => a.timestamp - b.timestamp || a.index - b.index),
		[expandedEvents, highlightWithin, selectedTime, allVisibleEvents],
	)

	const visibleActors = useMemo(
		() =>
			actors.map((actor) => ({
				...actor,
				highlighted: false,
				collapsed: !expandedActors.includes(actor.id),
				events: visibleEvents.filter((event) => actor.statements.some((e) => e.id === event.id)),
			})),
		[actors, expandedActors, visibleEvents],
	)

	// const simplifiedView = useMemo(() => {

	// })

	const eventActions = useMemo<('edit' | 'collapse')[]>(() => {
		if (isReadOnly) {
			return ['collapse']
		}
		return ['edit', 'collapse']
	}, [isReadOnly])
	const { currentTab, setCurrentTab, actorsVisible, eventsVisible } = useOutlinerTabs()

	const renderedActors = actorsVisible ? visibleActors : []
	const renderedEvents = eventsVisible ? visibleEvents : []
	const scrollerVisible = visibleActors.length > 0 || visibleEvents.length > 0

	const theme = useCustomTheme()
	const isLargeScreen = useMediaQuery(theme.material.breakpoints.up('lg'))

	return (
		<Profiler id="Outliner" onRender={reportComponentProfile}>
			{!isLargeScreen && <OutlinerControls />}
			<Stack height={'calc(100% - 16px)'} alignItems="center">
				<Grid container height="100%" maxWidth="xl">
					{isLargeScreen && (
						<Grid item lg={5} xs={12} sx={{ padding: 2, spacing: 2 }} height="100%">
							<EventCreator mode="create-compact" />
						</Grid>
					)}
					<Grid item lg={7} xs={12} sx={{ padding: 2, spacing: 2 }} height="100%">
						<OutlinedContainer label="World state" secondaryLabel={timeLabel} fullHeight>
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
														{/* <Tab label="Simplified" /> */}
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
								{!scrollerVisible && <OutlinerEmptyState />}
							</StatementsScroller>
						</OutlinedContainer>
					</Grid>
					<EventTutorialModal />
				</Grid>
			</Stack>
		</Profiler>
	)
}
