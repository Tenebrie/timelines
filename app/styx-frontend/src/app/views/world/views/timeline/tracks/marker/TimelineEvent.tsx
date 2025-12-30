import { MarkerType, TimelineEntity } from '@api/types/worldTypes'
import Close from '@mui/icons-material/Close'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import { useNavigate } from '@tanstack/react-router'
import classNames from 'classnames'
import { CSSProperties, memo, MouseEvent, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'

import { useEventIcons } from '@/app/features/icons/hooks/useEventIcons'
import { useCustomTheme } from '@/app/features/theming/hooks/useCustomTheme'
import { useWorldTime } from '@/app/features/time/hooks/useWorldTime'
import { useDoubleClick } from '@/app/hooks/useDoubleClick'
import { useEntityColor } from '@/app/utils/colors/useEntityColor'
import { isMultiselectClick } from '@/app/utils/isMultiselectClick'
import { worldSlice } from '@/app/views/world/WorldSlice'

import { TimelineEventHeightPx } from '../../hooks/useEventTracks'
import { MarkerTooltipSummonable } from '../../MarkerTooltip'
import { HoveredTimelineEvents } from '../components/HoveredTimelineEvents'
import { Marker, MarkerDelta, MarkerIcon, MarkerRevoked } from './styles'

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
	const { timeToLabel } = useWorldTime()
	const [isHovered, setIsHovered] = useState(false)
	const markerRef = useRef<HTMLDivElement>(null)

	const { triggerClick } = useDoubleClick<{ multiselect: boolean }>({
		onClick: ({ multiselect }) => {
			if (selected) {
				dispatch(removeTimelineMarkerFromSelection(entity.key))
			} else {
				dispatch(addTimelineMarkerToSelection({ ...entity, multiselect }))
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

	// Calculate absolute position for the timestamp box (above the marker)
	const getTimestampBoxPosition = () => {
		if (!markerRef.current) {
			return { left: 0, top: 0 }
		}
		const rect = markerRef.current.getBoundingClientRect()
		return {
			left: rect.left + rect.width / 2, // Center horizontally
			top: rect.top, // Position at the top of the marker
		}
	}

	const timestampBoxPosition = getTimestampBoxPosition()

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
			ref={markerRef}
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
			{true && (
				<MarkerTooltipSummonable>
					<Paper
						elevation={4}
						sx={{
							position: 'absolute',
							left: `${timestampBoxPosition.left}px`,
							top: `${timestampBoxPosition.top}px`,
							padding: '8px 12px',
							opacity: isHovered ? 1 : 0,
							transition: 'opacity 0.1s, transform 0.1s',
							pointerEvents: 'none',
							whiteSpace: 'nowrap',
							zIndex: 10,
							display: 'flex',
							flexDirection: 'column',
							gap: '4px',
							alignItems: 'center',
							transform: isHovered
								? 'translate(-50%, calc(-100% - 8px))'
								: 'translate(-50%, calc(-100% - 4px))',
						}}
					>
						<Typography variant="caption">{timeToLabel(entity.markerPosition)}</Typography>
						<Typography variant="caption" fontWeight={600}>
							{entity.name}
						</Typography>
					</Paper>
				</MarkerTooltipSummonable>
			)}
		</RenderedMarker>
	)
}
