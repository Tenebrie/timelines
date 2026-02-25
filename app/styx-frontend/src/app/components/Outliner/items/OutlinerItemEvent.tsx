import { WorldEvent } from '@api/types/worldTypes'
import { memo, useMemo } from 'react'
import { useSelector } from 'react-redux'

import { useOutlinerTabs } from '@/app/components/Outliner/hooks/useOutlinerTabs'
import { getOutlinerPreferences } from '@/app/features/preferences/PreferencesSliceSelectors'
import { isNull } from '@/app/utils/isNull'
import { useIsReadOnly } from '@/app/views/world/hooks/useIsReadOnly'
import { getWorldState } from '@/app/views/world/WorldSliceSelectors'

import { EventWithContentRenderer } from './OutlinerItemEvent/EventWithContentRenderer'

export const OutlinerItemEvent = memo(OutlinerItemEventComponent)

type Props = {
	event: WorldEvent
}

function OutlinerItemEventComponent({ event }: Props) {
	const { isReadOnly } = useIsReadOnly()
	const { revokedVisible } = useOutlinerTabs()
	const { selectedTime, search } = useSelector(getWorldState, (a, b) => a.selectedTime === b.selectedTime)
	const active = isNull(event.revokedAt) || event.revokedAt > selectedTime
	const actions = useMemo(() => {
		if (isReadOnly) {
			return ['collapse'] as const
		}
		return ['edit', 'delete', 'collapse'] as const
	}, [isReadOnly])

	const { expandedEvents } = useSelector(
		getOutlinerPreferences,
		(a, b) => a.expandedEvents === b.expandedEvents,
	)

	if (!active && !search.query && !revokedVisible) {
		return <div>Bad render</div>
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
