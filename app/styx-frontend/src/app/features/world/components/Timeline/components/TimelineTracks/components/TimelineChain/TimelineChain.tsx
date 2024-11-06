import { memo } from 'react'

import { hashCode } from '../../../../../../../../utils/hashCode'
import { MarkerType, TimelineEntity } from '../../../../../../types'

type Props = {
	entity: TimelineEntity<MarkerType>
	highlighted: boolean
}

export const TimelineChainComponent = ({ entity, highlighted }: Props) => {
	if (!entity.nextEntity) {
		return
	}
	const padding = 10
	const dist = entity.nextEntity.markerPosition - entity.markerPosition + padding - 7
	const height = -Math.min(dist / 10, 48)
	const color = hashCode(entity.eventId) % 2 === 0 ? 'rgb(255, 200, 200)' : 'rgb(200, 255, 200)'

	return (
		<div style={{ pointerEvents: 'none', position: 'absolute', top: -8 - padding - 75, left: 4 - padding }}>
			<svg width={dist + padding} height="100" viewBox={`0 -75 ${dist + padding} 100`}>
				<path
					d={`M ${padding - 5} ${padding + 5} C ${dist * 0.1} ${height + padding}, ${dist * 0.9} ${height + padding}, ${dist + 5} ${padding + 5}`}
					stroke={color}
					strokeWidth={3}
					fill="transparent"
				/>
			</svg>
		</div>
	)
}

export const TimelineChain = memo(TimelineChainComponent)
