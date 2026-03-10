import { useCheckRouteMatch } from '@/router-utils/hooks/useCheckRouteMatch'

import { ActorRouterHotkeys } from '../../features/entityEditor/actor/ActorRouterHotkeys'
import { EventRouterHotkeys } from '../../features/entityEditor/event/EventRouterHotkeys'

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
