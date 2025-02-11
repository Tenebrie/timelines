import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import { useCallback } from 'react'

import { TrunkatedTypography } from '@/app/components/TrunkatedTypography'
import { RichTextEditorReadonly } from '@/app/features/richTextEditor/RichTextEditorReadonly'
import { useWorldTime } from '@/app/features/time/hooks/useWorldTime'
import { useTimelineBusDispatch } from '@/app/features/worldTimeline/hooks/useTimelineBus'
import { Actor, WorldEvent } from '@/app/features/worldTimeline/types'
import { isNotNull } from '@/app/utils/isNotNull'

import { StyledListItemButton, ZebraWrapper } from '../../Outliner/styles'
import { useTimelineScroll } from '../../Timeline/hooks/useTimelineScroll'

type Props = {
	event: WorldEvent
	owningActor: Actor | null
	short: boolean
	active: boolean
}

export const EventContentRenderer = ({ event, active }: Props) => {
	const { timeToLabel } = useWorldTime()
	const scrollTimelineTo = useTimelineBusDispatch()
	const { getScroll: getTimelineScroll } = useTimelineScroll()

	const scrollTimelineToEvent = useCallback(() => {
		const scroll = getTimelineScroll()
		if (isNotNull(event.revokedAt) && Math.abs(scroll - event.timestamp) <= 5) {
			scrollTimelineTo(event.revokedAt)
		} else {
			scrollTimelineTo(event.timestamp)
		}
	}, [event.revokedAt, event.timestamp, scrollTimelineTo, getTimelineScroll])

	// const paragraphs = event.description.split('\n').filter((p) => p.trim().length > 0)
	const paragraphs = [event.descriptionRich]

	const revokedAtTimestamp = isNotNull(event.revokedAt) ? (
		<>
			, resolved at <b>{timeToLabel(event.revokedAt)}</b>
		</>
	) : (
		''
	)

	return (
		<>
			<List disablePadding>
				<ZebraWrapper $zebra>
					<ListItem disablePadding>
						<StyledListItemButton onClick={scrollTimelineToEvent}>
							<ListItemText
								data-hj-suppress
								primary={
									<>
										Happened at <b>{timeToLabel(event.timestamp)}</b>
										{revokedAtTimestamp}.
									</>
								}
								style={{ color: active ? 'inherit' : 'gray' }}
							></ListItemText>
						</StyledListItemButton>
					</ListItem>
				</ZebraWrapper>
				{paragraphs.map((p, index) => (
					<ZebraWrapper key={p} $zebra={index % 2 === 1}>
						<ListItem disablePadding>
							<StyledListItemButton disableRipple disableTouchRipple sx={{ cursor: 'default' }}>
								<ListItemText
									data-hj-suppress
									primary={
										<TrunkatedTypography
											$lines={10}
											sx={{ fontSize: '16px' }}
											style={{ whiteSpace: 'break-spaces' }}
											component="div"
										>
											<b>Content:</b>
											<RichTextEditorReadonly value={p} />
										</TrunkatedTypography>
									}
									style={{ color: active ? 'inherit' : 'gray' }}
								></ListItemText>
							</StyledListItemButton>
						</ListItem>
					</ZebraWrapper>
				))}
			</List>
		</>
	)
}
