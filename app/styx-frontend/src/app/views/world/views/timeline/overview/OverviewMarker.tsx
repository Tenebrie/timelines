import { MarkerType, TimelineEntity } from '@api/types/worldTypes'
import Box from '@mui/material/Box'
import { memo } from 'react'
import { Fragment } from 'react/jsx-runtime'

type OverviewMarkerProps = {
	marker: MarkerWithHeight
	minTime: number
	maxTime: number
	pixelsPerUnit: number
}

export type MarkerWithHeight = TimelineEntity<MarkerType> & {
	overviewHeight: number
}

export const OverviewMarker = memo(OverviewMarkerComponent)

function OverviewMarkerComponent({ marker, minTime, maxTime, pixelsPerUnit }: OverviewMarkerProps) {
	const leftPercent = ((marker.markerPosition - minTime) / (maxTime - minTime)) * 100
	const bottomPos = `calc(${marker.overviewHeight * pixelsPerUnit}px + 4px)`
	console.log('renderss')

	return (
		<Fragment key={marker.key}>
			<Box
				sx={{
					position: 'absolute',
					bottom: bottomPos,
					left: `${leftPercent}%`,
					width: '4px',
					height: '4px',
					borderRadius: '2px',
					background: marker.color,
				}}
			/>
			{marker.chainEntity && (
				<Box
					sx={{
						position: 'absolute',
						bottom: `calc(${marker.overviewHeight * pixelsPerUnit}px + 1px + 4px)`,
						left: `calc(${leftPercent}% + 2px)`,
						width: `${((marker.chainEntity.markerPosition - marker.markerPosition) * 100) / (maxTime - minTime)}%`,
						height: '2px',
						background: marker.color,
					}}
				/>
			)}
		</Fragment>
	)
}
