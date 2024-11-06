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
	const dist = entity.nextEntity.markerPosition - entity.markerPosition - 58 + padding
	const height = Math.min(dist / 30, 30)
	const color = hashCode(entity.eventId) % 2 === 0 ? 'rgb(255, 200, 200)' : 'rgb(200, 255, 200)'

	return (
		<div style={{ pointerEvents: 'none', position: 'absolute', top: -padding, left: 29 - padding }}>
			<svg width={dist + padding} height="400" viewBox={`0 0 ${dist + padding} 400`}>
				<path
					d={`M ${padding} ${padding} C ${dist * 0.25} ${height + padding}, ${dist * 0.75} ${height + padding}, ${dist + 2} ${padding}`}
					stroke={color}
					strokeWidth={3}
					fill="transparent"
				/>
				<circle cx={padding - 2} cy={10} r={4} fill="white" />
				<circle cx={dist + 4} cy={10} r={4} fill="white" />
			</svg>
		</div>
	)

	// const padding = 10
	// const dist = entity.nextEntity.markerPosition - entity.markerPosition - 58 + padding
	// const height = Math.min(dist / 30, 30)
	// const color = hashCode(entity.eventId) % 2 === 0 ? 'rgb(255, 200, 200)' : 'rgb(200, 255, 200)'

	// return (
	// 	<div style={{ pointerEvents: 'none', position: 'absolute', top: -padding, left: 29 - padding }}>
	// 		<svg width={dist + padding} height="400" viewBox={`0 0 ${dist + padding} 400`}>
	// 			<path
	// 				d={`M ${padding} ${padding} C ${dist * 0.25} ${height + padding}, ${dist * 0.75} ${height + padding}, ${dist + 2} ${padding}`}
	// 				stroke={color}
	// 				strokeWidth={3}
	// 				fill="transparent"
	// 			/>
	// 			<circle cx={padding - 2} cy={10} r={4} fill="white" />
	// 			<circle cx={dist + 4} cy={10} r={4} fill="white" />
	// 		</svg>
	// 	</div>
	// )
}

export const TimelineChain = memo(TimelineChainComponent)
