import { ArrowRightAlt, Link } from '@mui/icons-material'
import { List, ListItem, ListItemText } from '@mui/material'
import { useCallback } from 'react'

import { TrunkatedTypography } from '../../../../../components/TrunkatedTypography'
import { useWorldTime } from '../../../../time/hooks/useWorldTime'
import { useTimelineBusDispatch } from '../../../hooks/useTimelineBus'
import { Actor, WorldEvent } from '../../../types'
import { StatementActorsText, StyledListItemButton, ZebraWrapper } from '../../Outliner/styles'
import { useTimelineScroll } from '../../Timeline/hooks/useTimelineScroll'
import { useActorsToString } from './useActorsToString'

type Props = {
	event: WorldEvent
	owningActor: Actor | null
	short: boolean
	active: boolean
}

export const EventContentRenderer = ({ event, owningActor, short, active }: Props) => {
	const maxActorsDisplayed = short ? 2 : 5
	const actorsToString = useActorsToString()
	const targetActors = actorsToString(event.targetActors, owningActor, maxActorsDisplayed)
	const mentionedActors = actorsToString(event.mentionedActors, owningActor, maxActorsDisplayed)

	const { timeToLabel } = useWorldTime()
	const scrollTimelineTo = useTimelineBusDispatch()
	const { getScroll: getTimelineScroll } = useTimelineScroll()

	const scrollTimelineToEvent = useCallback(() => {
		const scroll = getTimelineScroll()
		if (event.revokedAt && Math.abs(scroll - event.timestamp) <= 5) {
			scrollTimelineTo(event.revokedAt)
		} else {
			scrollTimelineTo(event.timestamp)
		}
	}, [event.revokedAt, event.timestamp, scrollTimelineTo, getTimelineScroll])

	// const paragraphs = event.description.split('\n').filter((p) => p.trim().length > 0)
	const paragraphs = [event.description]

	const revokedAtTimestamp = event.revokedAt ? (
		<>
			, revoked at <b>{timeToLabel(event.revokedAt)}</b>
		</>
	) : (
		''
	)

	const targetActorIndex = paragraphs.length + 1
	const mentionedActorsIndex = targetActorIndex + targetActors.length > 0 ? 1 : 0

	return (
		<>
			<List disablePadding>
				<ZebraWrapper zebra>
					<ListItem disablePadding>
						<StyledListItemButton onClick={scrollTimelineToEvent}>
							<ListItemText
								data-hj-suppress
								primary={
									<>
										Issued at <b>{timeToLabel(event.timestamp)}</b>
										{revokedAtTimestamp}.
									</>
								}
								style={{ color: active ? 'inherit' : 'gray' }}
							></ListItemText>
						</StyledListItemButton>
					</ListItem>
				</ZebraWrapper>
				{paragraphs.map((p, index) => (
					<ZebraWrapper key={p} zebra={index % 2 === 1}>
						<ListItem disablePadding>
							<StyledListItemButton>
								<ListItemText
									data-hj-suppress
									primary={
										<TrunkatedTypography
											lines={10}
											sx={{ fontSize: '16px' }}
											style={{ whiteSpace: 'break-spaces' }}
										>
											<b>Content:</b>
											<br />
											{p}
										</TrunkatedTypography>
									}
									style={{ color: active ? 'inherit' : 'gray' }}
								></ListItemText>
							</StyledListItemButton>
						</ListItem>
					</ZebraWrapper>
				))}
				{targetActors.length > 0 && (
					<ZebraWrapper zebra={targetActorIndex % 2 === 0}>
						<ListItem disablePadding>
							<StyledListItemButton>
								<ListItemText
									data-hj-suppress
									primary={
										<TrunkatedTypography lines={3} component="span">
											<StatementActorsText>
												{event.targetActors.length > 0 ? <Link /> : ''} {targetActors}
											</StatementActorsText>
										</TrunkatedTypography>
									}
									style={{ color: active ? 'inherit' : 'gray' }}
								></ListItemText>
							</StyledListItemButton>
						</ListItem>
					</ZebraWrapper>
				)}
				{mentionedActors.length > 0 && (
					<ZebraWrapper zebra={mentionedActorsIndex % 2 === 1}>
						<ListItem disablePadding>
							<StyledListItemButton>
								<ListItemText
									data-hj-suppress
									primary={
										<TrunkatedTypography lines={3} component="span">
											<StatementActorsText>
												{event.mentionedActors.length > 0 ? <ArrowRightAlt /> : ''} {mentionedActors}
											</StatementActorsText>
										</TrunkatedTypography>
									}
									style={{ color: active ? 'inherit' : 'gray' }}
								></ListItemText>
							</StyledListItemButton>
						</ListItem>
					</ZebraWrapper>
				)}
			</List>
		</>
	)
}
