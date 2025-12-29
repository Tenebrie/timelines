import { MarkerType, TimelineEntity } from '@api/types/worldTypes'
import Close from '@mui/icons-material/Close'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useNavigate } from '@tanstack/react-router'
import classNames from 'classnames'
import { CSSProperties, memo, MouseEvent, useState } from 'react'
import { useDispatch } from 'react-redux'

import { useEventBusDispatch } from '@/app/features/eventBus'
import { useEventIcons } from '@/app/features/icons/hooks/useEventIcons'
import { useModal } from '@/app/features/modals/ModalsSlice'
import { useCustomTheme } from '@/app/features/theming/hooks/useCustomTheme'
import { useWorldTime } from '@/app/features/time/hooks/useWorldTime'
import { useDoubleClick } from '@/app/hooks/useDoubleClick'
import { useEntityColor } from '@/app/utils/colors/useEntityColor'
import { isMultiselectClick } from '@/app/utils/isMultiselectClick'
import { worldSlice } from '@/app/views/world/WorldSlice'

import { TimelineEventHeightPx } from '../../hooks/useEventTracks'
import { HoveredTimelineEvents } from '../components/HoveredTimelineEvents'
import { Marker, MarkerDelta, MarkerIcon, MarkerRevoked, TimestampPopover } from './styles'

type Props = {
	entity: TimelineEntity<MarkerType>
	selected: boolean
	trackHeight: number
}

export const TimelineEvent = memo(TimelineEventComponent)

export function TimelineEventComponent({ entity, selected }: Props) {
	const dispatch = useDispatch()
	const { openTimelineContextMenu, addTimelineMarkerToSelection, removeTimelineMarkerFromSelection } =
		worldSlice.actions

	const navigate = useNavigate({ from: '/world/$worldId/timeline' })

	const { getIconPath } = useEventIcons()
	const scrollTimelineTo = useEventBusDispatch({ event: 'timeline/requestScrollTo' })
	const { open: openEditEventModal } = useModal('editEventModal')
	const { timeToLabel } = useWorldTime()
	const [isHovered, setIsHovered] = useState(false)

	const { triggerClick } = useDoubleClick<{ multiselect: boolean }>({
		onClick: ({ multiselect }) => {
			if (selected) {
				dispatch(removeTimelineMarkerFromSelection(entity.key))
				// navigate({
				// 	search: (prev) => ({ ...prev, selection: prev.selection.filter((id) => id !== entity.key) }),
				// })
			} else {
				dispatch(addTimelineMarkerToSelection({ ...entity, multiselect }))
				// navigate({
				// 	search: (prev) => ({
				// 		...prev,
				// 		selection: [...(multiselect ? prev.selection : []), entity.key],
				// 		track: entity.worldEventTrackId ?? undefined,
				// 	}),
				// })
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
			dispatch(addTimelineMarkerToSelection({ ...entity, multiselect }))
			// scrollTimelineTo({ timestamp: entity.markerPosition })
			// openEditEventModal({ eventId: entity.eventId })
		},
		ignoreDelay: true,
	})

	const onClick = (clickEvent: MouseEvent<HTMLDivElement>) => {
		clickEvent.stopPropagation()
		clickEvent.preventDefault()

		triggerClick(clickEvent, { multiselect: isMultiselectClick(clickEvent) })
	}

	const onContextMenu = (clickEvent: MouseEvent<HTMLDivElement>) => {
		if (clickEvent.shiftKey) {
			return
		}

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
		HoveredTimelineEvents.hoverEvent(entity)
		setIsHovered(true)
	}

	const onMouseLeave = () => {
		HoveredTimelineEvents.unhoverEvent(entity)
		setIsHovered(false)
	}

	const color = useEntityColor({ entity })
	const theme = useCustomTheme()

	const cssVariables = {
		'--border-color': color,
		'--icon-path': `url(${getIconPath(entity.icon)})`,
		'--marker-size': `${TimelineEventHeightPx - 6}px`,
		'--border-radius': '6px',
	} as CSSProperties

	const RenderedMarker = (() => {
		if (entity.markerType === 'deltaState') {
			return MarkerDelta
		} else if (entity.markerType === 'revokedAt') {
			return MarkerRevoked
		}
		return Marker
	})()

	return (
		<RenderedMarker
			style={cssVariables}
			onClick={onClick}
			onContextMenu={onContextMenu}
			onMouseEnter={onMouseEnter}
			onMouseLeave={onMouseLeave}
			$theme={theme}
			className={classNames({
				selected,
			})}
		>
			<MarkerIcon className="icon image"></MarkerIcon>
			{entity.markerType === 'revokedAt' && (
				<MarkerIcon className="icon">
					<Close sx={{ width: 'calc(100% - 2px)', height: 'calc(100% - 2px)' }} />
				</MarkerIcon>
			)}
			{!entity.chainEntity && (
				<Box
					sx={{
						position: 'absolute',
						left: 'calc(100% + 8px)',
						top: '50%',
						transform: 'translateY(-50%)',
						background: theme.custom.palette.background.timelineMarkerTail,
						border: `1px solid ${color}`,
						borderRadius: '6px',
						padding: '4px 8px',
						opacity: isHovered ? 1 : 0,
						transition: 'opacity 0.2s',
						pointerEvents: 'none',
						whiteSpace: 'nowrap',
						zIndex: 10,
					}}
				>
					<Typography variant="caption" fontWeight={600}>
						{entity.name}
					</Typography>
				</Box>
			)}
			<TimestampPopover $theme={theme} className={classNames({ visible: isHovered })}>
				<Typography variant="caption">{timeToLabel(entity.markerPosition)}</Typography>
			</TimestampPopover>
		</RenderedMarker>
	)
}
