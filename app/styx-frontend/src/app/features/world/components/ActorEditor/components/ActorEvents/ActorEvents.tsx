import { useSelector } from 'react-redux'

import { useWorldRouter } from '../../../../../../../router/routes/worldRoutes'
import { OutlinedContainer } from '../../../../../../components/OutlinedContainer'
import { isNull } from '../../../../../../utils/isNull'
import { getOutlinerPreferences } from '../../../../../preferences/selectors'
import { useWorldTime } from '../../../../../time/hooks/useWorldTime'
import { getWorldState } from '../../../../selectors'
import { Actor } from '../../../../types'
import { EventWithContentRenderer } from '../../../Renderers/Event/EventWithContentRenderer'
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
