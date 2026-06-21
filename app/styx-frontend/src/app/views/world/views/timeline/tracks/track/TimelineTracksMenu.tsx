import { useMoveWorldEventTrackMutation } from '@api/worldEventTracksApi'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import { memo, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { useDragDrop } from '@/app/features/dragDrop/hooks/useDragDrop'
import { useDragDropReceiver } from '@/app/features/dragDrop/hooks/useDragDropReceiver'
import { useBrowserSpecificScrollbars } from '@/app/hooks/useBrowserSpecificScrollbars'
import { getTimelineState, getWorldIdState } from '@/app/views/world/WorldSliceSelectors'

import { TimelineTrack } from '../../hooks/useEventTracks'
import { timelineSlice } from '../../TimelineSlice'
import { TimelineTracksMenuItem } from './TimelineTracksMenuItem'

export const TimelineTracksMenu = memo(TimelineTracksMenuComponent)

function TimelineTracksMenuComponent() {
	const { allTracks } = useSelector(getTimelineState, (a, b) => a.allTracks === b.allTracks)
	const sortedTracks = [...allTracks].sort((a, b) => b.position - a.position)

	return (
		<Stack
			sx={{
				marginTop: -3,
				marginBottom: 3,
				overflowX: 'hidden',
				overflowY: 'scroll',
				height: '60vh',
				...useBrowserSpecificScrollbars(),
			}}
		>
			<Table sx={{ userSelect: 'none' }}>
				<TableHead>
					<TableRow>
						<TableCell sx={{ margin: 0, padding: 0, minWidth: 2 }}></TableCell>
						<TableCell width={'1px'} sx={{ margin: 0, padding: 1, paddingRight: 0, minWidth: 72 }}>
							Visibility
						</TableCell>
						<TableCell>Name</TableCell>
						<TableCell>Navigation</TableCell>
						<TableCell>Actions</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{sortedTracks.map((track) => (
						<DragDropWrapper key={track.id} track={track} />
					))}
				</TableBody>
			</Table>
		</Stack>
	)
}

function DragDropWrapper({ track }: { track: TimelineTrack }) {
	const worldId = useSelector(getWorldIdState)
	const [moveWorldEventTrack] = useMoveWorldEventTrackMutation()

	const { updateTrack } = timelineSlice.actions
	const dispatch = useDispatch()

	const { ref: draggableRef, ghostElement } = useDragDrop({
		type: 'timelineTrack',
		params: { track },
		ghostAlign: {
			top: 'center',
			left: 'start',
		},
		adjustPosition: ({ x, y }) => ({
			x: x - 12,
			y,
		}),
		ghostFactory: () => (
			<Box sx={{ background: '#00000033', borderRadius: '6px', width: '800px' }}>
				<table>
					<tbody>
						<TimelineTracksMenuItem track={track} />
					</tbody>
				</table>
			</Box>
		),
	})

	const receiverRef = useRef<HTMLTableRowElement | null>(null)
	useDragDropReceiver({
		type: 'timelineTrack',
		receiverRef,
		onDrop: ({ params }) => {
			const movedTrack = params.track
			const delta = movedTrack.position > track.position ? -1 : 1
			dispatch(
				updateTrack({
					trackId: movedTrack.id,
					position: track.position + delta,
				}),
			)
			moveWorldEventTrack({
				worldId,
				body: {
					trackId: movedTrack.id,
					position: track.position + delta,
				},
			})
		},
	})

	return (
		<>
			<TimelineTracksMenuItem
				key={track.id}
				track={track}
				draggableRef={draggableRef}
				receiverRef={receiverRef}
			/>
			{ghostElement}
		</>
	)
}
