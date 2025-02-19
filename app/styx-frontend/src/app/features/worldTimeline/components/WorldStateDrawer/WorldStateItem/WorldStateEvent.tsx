import { memo, useMemo } from 'react'
import { useSelector } from 'react-redux'

import { getOutlinerPreferences } from '@/app/features/preferences/selectors'
import { getWorldState } from '@/app/features/world/selectors'
import { useOutlinerTabs } from '@/app/features/worldTimeline/hooks/useOutlinerTabs'
import { WorldEvent } from '@/app/features/worldTimeline/types'
import { useIsReadOnly } from '@/app/hooks/useIsReadOnly'
import { isNull } from '@/app/utils/isNull'

import { EventWithContentRenderer } from '../../Renderers/Event/EventWithContentRenderer'

export const WorldStateEvent = memo(WorldStateEventComponent)

type Props = {
	event: WorldEvent
}

function WorldStateEventComponent({ event }: Props) {
	const { isReadOnly } = useIsReadOnly()
	const { revokedVisible } = useOutlinerTabs()
	const { selectedTime, search } = useSelector(getWorldState, (a, b) => a.selectedTime === b.selectedTime)
	const active = isNull(event.revokedAt) || event.revokedAt > selectedTime
	const actions = useMemo(() => {
		if (isReadOnly) {
			return ['collapse'] as const
		}
		return ['edit', 'collapse'] as const
	}, [isReadOnly])

	const { expandedEvents } = useSelector(
		getOutlinerPreferences,
		(a, b) => a.expandedEvents === b.expandedEvents,
	)

	if (!active && !search.query && !revokedVisible) {
		return <div>Why</div>
	}

	return (
		<EventWithContentRenderer
			collapsed={!expandedEvents.includes(event.id)}
			event={event}
			divider={true}
			short={false}
			active={active}
			owningActor={null}
			actions={actions}
		/>
	)
}
