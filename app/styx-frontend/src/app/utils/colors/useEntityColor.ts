import { MarkerType, TimelineEntity } from '@/app/features/worldTimeline/types'

import { useStringColor } from './useStringColor'

type Props = {
	entity: TimelineEntity<MarkerType>
}

export function useEntityColor({ entity }: Props) {
	const legacyColor = useStringColor(entity.eventId)
	if (entity.color && entity.color !== '#000000') {
		return entity.color
	}
	const color = entity.color
	return color === '#000000' ? legacyColor : color
}
