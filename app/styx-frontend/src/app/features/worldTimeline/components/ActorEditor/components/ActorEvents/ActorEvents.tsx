import { useSelector } from 'react-redux'

import { OutlinedContainer } from '@/app/components/OutlinedContainer'
import { getOutlinerPreferences } from '@/app/features/preferences/selectors'
import { useWorldTime } from '@/app/features/time/hooks/useWorldTime'
import { EventWithContentRenderer } from '@/app/features/worldTimeline/components/Renderers/Event/EventWithContentRenderer'
import { getWorldState } from '@/app/features/worldTimeline/selectors'
import { Actor } from '@/app/features/worldTimeline/types'
import { isNull } from '@/app/utils/isNull'

import { StatementsScroller } from '../../styles'
import { ActorEventsEmptyState } from './ActorEventsEmptyState'

type Props = {
	actor: Actor
}

export const ActorEvents = ({ actor }: Props) => {
	const { events, selectedTime } = useSelector(getWorldState)
	const { timeToLabel } = useWorldTime()

	const { expandedEvents } = useSelector(getOutlinerPreferences)

	const visibleEvents = events
		.filter((event) => event.mentionedActors.some((targetActor) => targetActor.id === actor.id))
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
