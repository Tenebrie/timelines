import Chip from '@mui/material/Chip'
import { useSelector } from 'react-redux'

import { useEventBusDispatch } from '@/app/features/eventBus'
import { getWorldState } from '@/app/features/worldTimeline/selectors'
import { colorStringToHsl } from '@/app/utils/colors/colorStringToHsl'
import { getContrastTextColor } from '@/app/utils/colors/getContrastTextColor'
import { worldTimelineRoutes } from '@/router/routes/featureRoutes/worldTimelineRoutes'
import { QueryParams } from '@/router/routes/QueryParams'
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
	const parsedColor = colorStringToHsl(actorColor ?? '#000')

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
			style={{
				background: `linear-gradient(90deg,
					hsl(${parsedColor.h * 360 - 15}deg, ${parsedColor.s * 100}%, ${parsedColor.l * 100}%) 0%,
					hsl(${parsedColor.h * 360 + 0}deg, ${parsedColor.s * 100}%, ${parsedColor.l * 100}%) 50%,
					hsl(${parsedColor.h * 360 + 15}deg, ${parsedColor.s * 100}%, ${parsedColor.l * 100}%) 100%)`,
			}}
			label={actorName}
		/>
	)
}
