import Close from '@mui/icons-material/Close'
import { colors } from '@mui/material'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useNavigate } from '@tanstack/react-router'
import classNames from 'classnames'
import { CSSProperties, memo, MouseEvent, Profiler, useState } from 'react'
import { useDispatch } from 'react-redux'

import { useEventBusDispatch } from '@/app/features/eventBus'
import { reportComponentProfile } from '@/app/features/profiling/reportComponentProfile'
import { worldSlice } from '@/app/features/world/reducer'
import { useEventIcons } from '@/app/features/worldTimeline/hooks/useEventIcons'
import { MarkerType, TimelineEntity } from '@/app/features/worldTimeline/types'
import { useCustomTheme } from '@/app/hooks/useCustomTheme'
import { useDoubleClick } from '@/app/hooks/useDoubleClick'
import { useEntityColor } from '@/app/utils/colors/useEntityColor'
import { isMultiselectClick } from '@/app/utils/isMultiselectClick'

import { TimelineEventHeightPx } from '../../hooks/useEventTracks'
import { HoveredTimelineEvents } from './HoveredTimelineEvents'
import { Marker } from './styles'

type Props = {
	entity: TimelineEntity<MarkerType>
	edited: boolean
	selected: boolean
	trackHeight: number
}

export const TimelineEvent = memo(TimelineEventComponent)

export function TimelineEventComponent({ entity, edited, selected }: Props) {
	const [isInfoVisible, setIsInfoVisible] = useState(false)

	const dispatch = useDispatch()
	const { openTimelineContextMenu } = worldSlice.actions

	const navigate = useNavigate({ from: '/world/$worldId/timeline' })

	const { getIconPath } = useEventIcons()
	const scrollTimelineTo = useEventBusDispatch({ event: 'scrollTimelineTo' })
	const openEventDrawer = useEventBusDispatch({ event: 'timeline/openEventDrawer' })

	const { triggerClick } = useDoubleClick<{ multiselect: boolean }>({
		onClick: ({ multiselect }) => {
			if (selected) {
				navigate({
					search: (prev) => ({ ...prev, selection: prev.selection.filter((id) => id !== entity.key) }),
				})
			} else {
				navigate({
					search: (prev) => ({ ...prev, selection: [...(multiselect ? prev.selection : []), entity.key] }),
				})
			}
		},
		onDoubleClick: ({ multiselect }) => {
			if (entity.markerType === 'ghostEvent' || entity.markerType === 'ghostDelta') {
				return
			}

			navigate({
				search: (prev) => ({
					...prev,
					time: entity.markerPosition,
					selection: [...(multiselect ? prev.selection : []), entity.key],
				}),
			})
			scrollTimelineTo({ timestamp: entity.markerPosition })
			openEventDrawer({})
		},
		ignoreDelay: true,
	})

	const onClick = (clickEvent: MouseEvent<HTMLDivElement>) => {
		clickEvent.stopPropagation()
		clickEvent.preventDefault()

		triggerClick(clickEvent, { multiselect: isMultiselectClick(clickEvent) })
	}

	const onContextMenu = (clickEvent: MouseEvent<HTMLDivElement>) => {
		clickEvent.stopPropagation()
		clickEvent.preventDefault()

		dispatch(
			openTimelineContextMenu({
				selectedEvent: entity,
				mousePos: {
					x: clickEvent.clientX + 1,
					y: clickEvent.clientY,
				},
				selectedTime: entity.markerPosition,
			}),
		)
	}

	const onMouseEnter = () => {
		setIsInfoVisible(true)
		HoveredTimelineEvents.hoverEvent(entity)
	}

	const onMouseLeave = () => {
		setIsInfoVisible(false)
		HoveredTimelineEvents.unhoverEvent(entity)
	}

	const labelType =
		entity.markerType === 'issuedAt' ? (
			<b style={{ color: colors.green[500] }}>Event:</b>
		) : entity.markerType === 'revokedAt' ? (
			<b style={{ color: colors.red[500] }}>Resolve:</b>
		) : entity.markerType === 'deltaState' ? (
			<b style={{ color: colors.yellow[500] }}>Data Point:</b>
		) : (
			''
		)

	const color = useEntityColor({ entity })
	const theme = useCustomTheme()

	const isDataPoint = entity.markerType === 'deltaState' || entity.markerType === 'ghostDelta'
	const cssVariables = {
		'--border-color': color,
		'--icon-path': `url(${getIconPath(entity.icon)})`,
		'--marker-size': `${TimelineEventHeightPx - 6}px`,
		'--border-radius': isDataPoint ? '50%' : '4px',
	} as CSSProperties

	return (
		<Profiler id="TimelineEvent" onRender={reportComponentProfile}>
			<Marker
				style={cssVariables}
				onClick={onClick}
				onContextMenu={onContextMenu}
				onMouseEnter={onMouseEnter}
				onMouseLeave={onMouseLeave}
				$theme={theme}
				className={classNames({
					selected,
					edited,
					revoked: entity.markerType === 'revokedAt',
					replace: entity.markerType === 'deltaState' || entity.markerType === 'ghostDelta',
					ghostEvent: entity.markerType === 'ghostEvent',
					ghostDelta: entity.markerType === 'ghostDelta',
				})}
				data-testid="timeline-event-marker"
			>
				{entity.markerType !== 'revokedAt' && <div className="icon image"></div>}
				{entity.markerType === 'revokedAt' && (
					<>
						<div className="icon image"></div>
						<div className="icon">
							<Close sx={{ width: 'calc(100% - 2px)', height: 'calc(100% - 2px)' }} />
						</div>
					</>
				)}
				{isInfoVisible && (
					<Box
						sx={{
							position: 'absolute',
							bottom: 2,
							left: 34,
							width: 196,
							height: 64,
							background: theme.custom.palette.background.soft,
							display: 'flex',
							paddingLeft: '8px',
							paddingRight: 0,
							borderRadius: '8px 8px 8px 0px',
							borderTop: `2px solid ${color}`,
							borderLeft: `2px solid ${color}`,
							pointerEvents: 'none',
						}}
					>
						<Stack sx={{ height: 28, justifyContent: 'center' }}>
							<Typography variant="caption" fontWeight={800} noWrap style={{ overflowY: 'visible' }}>
								{entity.name}
							</Typography>
							{/* <Typography sx={{ color: 'white' }}>
								{labelType}
								{labelType ? ' ' : ''}
								{entity.name}
							</Typography> */}
						</Stack>
					</Box>
					// <LabelContainer>
					// 	<Label data-hj-suppress>

					// 	</Label>
					// </LabelContainer>
				)}
			</Marker>
		</Profiler>
	)
}
