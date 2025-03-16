import { useCheckRouteMatch } from '@/router-utils/hooks/useCheckRouteMatch'

import { ActorRouterHotkeys } from './editors/actor/ActorRouterHotkeys'
import { EventRouterHotkeys } from './editors/event/EventRouterHotkeys'

export function OutlinerOutlet() {
	const isTimeline = useCheckRouteMatch('/world/$worldId/timeline')
	const isMindmap = useCheckRouteMatch('/world/$worldId/mindmap')

	return (
		<>
			{isTimeline && <EventRouterHotkeys />}
			{isMindmap && <ActorRouterHotkeys />}
		</>
	)
}
