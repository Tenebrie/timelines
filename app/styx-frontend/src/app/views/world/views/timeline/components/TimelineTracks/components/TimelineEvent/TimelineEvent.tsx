import { MarkerType, TimelineEntity } from '@api/types/types'
import Close from '@mui/icons-material/Close'
import { colors } from '@mui/material'
import { useNavigate } from '@tanstack/react-router'
import classNames from 'classnames'
import { CSSProperties, memo, MouseEvent } from 'react'
import { useDispatch } from 'react-redux'

import { useEventBusDispatch } from '@/app/features/eventBus'
import { useEventIcons } from '@/app/features/icons/useEventIcons'
import { useCustomTheme } from '@/app/features/theming/useCustomTheme'
import { useDoubleClick } from '@/app/hooks/useDoubleClick'
import { useEntityColor } from '@/app/utils/colors/useEntityColor'
import { isMultiselectClick } from '@/app/utils/isMultiselectClick'
import { worldSlice } from '@/app/views/world/WorldSlice'

import { TimelineEventHeightPx } from '../../hooks/useEventTracks'
import { HoveredTimelineEvents } from './HoveredTimelineEvents'
import { Marker, MarkerDelta, MarkerIcon, MarkerRevoked } from './styles'

type Props = {
	entity: TimelineEntity<MarkerType>
	selected: boolean
	trackHeight: number
}

export const TimelineEvent = memo(TimelineEventComponent)

export function TimelineEventComponent({ entity, selected }: Props) {
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
		HoveredTimelineEvents.hoverEvent(entity)
	}

	const onMouseLeave = () => {
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

	// TODO: Split this marker for performance, it's horrible for css compilation
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
			{entity.markerType !== 'revokedAt' && <MarkerIcon className="icon image"></MarkerIcon>}
			{entity.markerType === 'revokedAt' && (
				<>
					<MarkerIcon className="icon image"></MarkerIcon>
					<MarkerIcon className="icon">
						<Close sx={{ width: 'calc(100% - 2px)', height: 'calc(100% - 2px)' }} />
					</MarkerIcon>
				</>
			)}
		</RenderedMarker>
	)
}
