import Box from '@mui/material/Box'
import { useSearch } from '@tanstack/react-router'

import { OutlinerContent } from '@/app/components/Outliner/OutlinerContent'
import { useCheckRouteMatch } from '@/router-utils/hooks/useCheckRouteMatch'

import { ActorRouter } from './editors/actor/ActorRouter'
import { EventRouter } from './editors/event/EventRouter'

export function Outliner() {
	const { isCreating, selection } = useSearch({
		from: '/world/$worldId/_world',
		select: (search) => ({
			isCreating: search.new,
			selection: search.selection,
		}),
	})

	const entityDrawerVisible = isCreating || selection.length > 0

	const isTimeline = useCheckRouteMatch('/world/$worldId/timeline')
	const isMindmap = useCheckRouteMatch('/world/$worldId/mindmap')

	return (
		<Box position={'relative'} height={'100%'}>
			<Box visibility={entityDrawerVisible ? 'hidden' : 'visible'} height={1}>
				<OutlinerContent />
			</Box>
			<Box
				position={'absolute'}
				top={0}
				left={0}
				right={0}
				bottom={0}
				visibility={entityDrawerVisible ? 'visible' : 'hidden'}
			>
				{isTimeline && <EventRouter />}
				{isMindmap && <ActorRouter />}
			</Box>
		</Box>
	)
}
