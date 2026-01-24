import Box from '@mui/material/Box'
import { memo, useMemo, useRef } from 'react'
import { useSelector } from 'react-redux'
import useEvent from 'react-use-event-hook'

import { useEventBusDispatch } from '@/app/features/eventBus'
import { getTimelineState } from '@/app/views/world/WorldSliceSelectors'

import { useTimelineHorizontalScroll } from '../hooks/useTimelineHorizontalScroll'
import { OverviewCamera } from './OverviewCamera'
import { MarkerWithHeight, OverviewMarker } from './OverviewMarker'

export const TimelineOverview = memo(TimelineOverviewComponent)

function TimelineOverviewComponent() {
	const { markers, tracks } = useSelector(
		getTimelineState,
		(a, b) => a.markers === b.markers && a.tracks === b.tracks,
	)
	const ref = useRef<HTMLDivElement>(null)
	const scrollTimelineTo = useEventBusDispatch['timeline/requestScrollTo']()

	// Wheel scrolling
	const { onWheel } = useTimelineHorizontalScroll({ containerRef: ref })

	const areaSize = ref.current?.getBoundingClientRect().width ?? 100

	const sortedMarkers = useMemo(
		() => [...markers].sort((a, b) => a.markerPosition - b.markerPosition),
		[markers],
	)

	const { minTime, maxTime } = useMemo(() => {
		if (sortedMarkers.length === 0) {
			return {
				minTime: 0,
				maxTime: 100,
			}
		}
		const min = sortedMarkers[0].markerPosition
		const max = sortedMarkers[sortedMarkers.length - 1].markerPosition
		const diff = Math.max(max - min, 10000)
		return {
			minTime: min - diff * 0.01,
			maxTime: max + diff * 0.01,
		}
	}, [sortedMarkers])

	const trackHeightMap = useMemo(() => {
		const map = new Map<string, number>()
		let cumulativeHeight = 0

		const sortedTracks = [...tracks].sort((a, b) => a.position - b.position)

		sortedTracks.forEach((track) => {
			map.set(track.id, cumulativeHeight)
			const trackHeight = Math.max(...track.events.map((e) => e.markerHeight), -1) + 1
			cumulativeHeight += trackHeight
		})

		return { map, maxHeight: cumulativeHeight }
	}, [tracks])

	console.log('Render')
	const heightSortedMarkers = useMemo((): MarkerWithHeight[] => {
		console.log('sorted')
		return markers
			.map((marker) => {
				const trackHeight = marker.worldEventTrackId
					? (trackHeightMap.map.get(marker.worldEventTrackId) ?? 0)
					: 0
				return {
					...marker,
					overviewHeight: trackHeight + marker.markerHeight,
				}
			})
			.sort((a, b) => a.overviewHeight - b.overviewHeight)
	}, [markers, trackHeightMap.map])

	const pixelsPerUnit = useMemo(() => {
		const maxHeight = trackHeightMap.maxHeight + 1
		return maxHeight > 0 ? Math.min(64 / maxHeight, 10) : 1
	}, [trackHeightMap.maxHeight])

	const handleOverviewMouseDown = useEvent((e: React.MouseEvent) => {
		if (e.button !== 0 || markers.length === 0 || !ref.current) {
			return
		}

		const rect = ref.current.getBoundingClientRect()
		const clickX = e.clientX - rect.left - 3
		const totalTimeRange = maxTime - minTime
		const clickTime = (clickX / areaSize) * totalTimeRange + minTime

		scrollTimelineTo({ timestamp: clickTime, skipAnim: false })
		e.preventDefault()
	})

	return (
		<Box
			ref={ref}
			data-overview-container
			onMouseDown={handleOverviewMouseDown}
			onWheel={onWheel}
			sx={{
				width: '100%',
				height: '64px',
				position: 'absolute',
				overflow: 'hidden',
				top: 0,
				background: '#00000022',
				cursor: 'pointer',
				zIndex: 1,
				borderBottom: `1px solid #ffffff22`,
			}}
		>
			{heightSortedMarkers.map((marker) => (
				<OverviewMarker
					key={marker.key}
					marker={marker}
					minTime={minTime}
					maxTime={maxTime}
					pixelsPerUnit={pixelsPerUnit}
				/>
			))}
			<OverviewCamera minTime={minTime} maxTime={maxTime} overviewWidth={areaSize} />
		</Box>
	)
}
