import Chip from '@mui/material/Chip'
import { useSelector } from 'react-redux'

import { useEventBusDispatch } from '@/app/features/eventBus'
import { getWorldState } from '@/app/features/worldTimeline/selectors'
import { getContrastTextColor } from '@/app/utils/getContrastTextColor'
import { QueryParams } from '@/router/routes/QueryParams'
import { worldTimelineRoutes } from '@/router/routes/worldTimelineRoutes'
import { QueryStrategy } from '@/router/types'

type Props = {
	actorId: string
}

export const MentionChipInternal = ({ actorId }: Props) => {
	const { id: worldId, actors } = useSelector(getWorldState, (a, b) => a.id === b.id && a.actors === b.actors)
	const actor = actors.find((actor) => actor.id === actorId)
	const actorName = actor ? `@${actor.name}` : '@Unknown Actor'
	const actorColor = actor ? actor.color : undefined
	const navigateTo = useEventBusDispatch({
		event: 'navigate/worldTimeline',
	})

	const textColor = getContrastTextColor(actorColor ?? '#eee')

	return (
		<Chip
			size="small"
			sx={{
				height: '1.6em',
				'& .MuiChip-label': { fontSize: '1em' },
				color: textColor,
				backgroundColor: actorColor,
			}}
			onClick={() =>
				navigateTo({
					target: worldTimelineRoutes.actorEditor,
					args: { worldId, actorId },
					query: { [QueryParams.SELECTED_TIME]: QueryStrategy.Preserve },
				})
			}
			label={actorName}
		/>
	)
}
