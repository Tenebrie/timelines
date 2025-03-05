import { Actor } from '@api/types/types'
import { useSelector } from 'react-redux'

import { OutlinedContainer } from '@/app/components/OutlinedContainer'
import { EventWithContentRenderer } from '@/app/components/Outliner/items/OutlinerItemEvent/EventWithContentRenderer'
import { getOutlinerPreferences } from '@/app/features/preferences/PreferencesSliceSelectors'
import { useWorldTime } from '@/app/features/time/hooks/useWorldTime'
import { isNull } from '@/app/utils/isNull'
import { getWorldState } from '@/app/views/world/WorldSliceSelectors'

import { StatementsScroller } from '../../styles'
import { ActorEventsEmptyState } from './ActorEventsEmptyState'

type Props = {
	actor: Actor
}

export const ActorEvents = ({ actor }: Props) => {
	const { events, selectedTime } = useSelector(getWorldState)
	const { timeToLabel } = useWorldTime()

	const { expandedEvents } = useSelector(getOutlinerPreferences)
	const mentionedInEvents = actor.mentionedIn
		.filter((mention) => mention.targetId === actor.id)
		.map((mention) => mention.sourceId)

	const visibleEvents = events
		.filter((event) => mentionedInEvents.includes(event.id))
		.map((event) => ({
			...event,
			secondary: timeToLabel(event.timestamp),
			collapsed: !expandedEvents.includes(event.id),
			active: isNull(event.revokedAt) || event.revokedAt > selectedTime,
		}))

	return (
		<OutlinedContainer label="Mentions" fullHeight>
			<StatementsScroller>
				{visibleEvents.map((event) => (
					<EventWithContentRenderer
						key={event.id}
						{...event}
						event={event}
						owningActor={actor}
						short
						divider
						actions={['collapse']}
					/>
				))}
				{visibleEvents.length === 0 && <ActorEventsEmptyState />}
			</StatementsScroller>
		</OutlinedContainer>
	)
}
