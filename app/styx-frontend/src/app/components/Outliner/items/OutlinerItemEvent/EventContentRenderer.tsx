import { Actor, WorldEvent } from '@api/types/types'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import { useCallback } from 'react'

import { TrunkatedTypography } from '@/app/components/TrunkatedTypography'
import { useEventBusDispatch } from '@/app/features/eventBus'
import { RichTextEditorReadonly } from '@/app/features/richTextEditor/RichTextEditorReadonly'
import { useWorldTime } from '@/app/features/time/hooks/useWorldTime'
import { isNotNull } from '@/app/utils/isNotNull'
import {
	StyledListItemButton,
	ZebraWrapper,
} from '@/app/views/world/views/timeline/components/TimelineShelf/styles'
import { TimelineState } from '@/app/views/world/views/timeline/utils/TimelineState'

type Props = {
	event: WorldEvent
	owningActor: Actor | null
	short: boolean
	active: boolean
}

export const EventContentRenderer = ({ event, active }: Props) => {
	const { timeToLabel } = useWorldTime()
	const scrollTimelineTo = useEventBusDispatch({ event: 'scrollTimelineTo' })

	const scrollTimelineToEvent = useCallback(() => {
		const scroll = TimelineState.scroll
		if (isNotNull(event.revokedAt) && Math.abs(scroll - event.timestamp) <= 5) {
			scrollTimelineTo({ timestamp: event.revokedAt })
		} else {
			scrollTimelineTo({ timestamp: event.timestamp })
		}
	}, [event.revokedAt, event.timestamp, scrollTimelineTo])

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
