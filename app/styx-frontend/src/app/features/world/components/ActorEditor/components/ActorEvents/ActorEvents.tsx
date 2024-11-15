import { useSelector } from 'react-redux'

import { OutlinedContainer } from '@/app/components/OutlinedContainer'
import { getOutlinerPreferences } from '@/app/features/preferences/selectors'
import { useWorldTime } from '@/app/features/time/hooks/useWorldTime'
import { EventWithContentRenderer } from '@/app/features/world/components/Renderers/Event/EventWithContentRenderer'
import { getWorldState } from '@/app/features/world/selectors'
import { Actor } from '@/app/features/world/types'
import { isNull } from '@/app/utils/isNull'
import { useWorldRouter } from '@/router/routes/worldRoutes'

import { StatementsScroller } from '../../styles'
import { ActorEventsEmptyState } from './ActorEventsEmptyState'

type Props = {
	actor: Actor
}

export const ActorEvents = ({ actor }: Props) => {
	const { events } = useSelector(getWorldState)
	const { timeToLabel } = useWorldTime()

	const { expandedEvents } = useSelector(getOutlinerPreferences)

	const { selectedTimeOrZero } = useWorldRouter()

	const visibleEvents = events
		.filter((event) => event.targetActors.some((targetActor) => targetActor.id === actor.id))
		.map((event) => ({
			...event,
			secondary: timeToLabel(event.timestamp),
			collapsed: !expandedEvents.includes(event.id),
			active: isNull(event.revokedAt) || event.revokedAt > selectedTimeOrZero,
		}))

	return (
		<OutlinedContainer label="Related events" fullHeight>
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
