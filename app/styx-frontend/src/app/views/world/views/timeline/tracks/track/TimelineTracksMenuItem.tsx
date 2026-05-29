import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
import EditIcon from '@mui/icons-material/Edit'
import FirstPageIcon from '@mui/icons-material/FirstPage'
import LastPageIcon from '@mui/icons-material/LastPage'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Input from '@mui/material/Input'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import { memo, useCallback, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { useUpdateWorldEventTrackMutation } from '@/api/worldEventTracksApi'
import { IsDragDropStateOfType } from '@/app/features/dragDrop/DragDropState'
import { useDragDropStateWithRenders } from '@/app/features/dragDrop/hooks/useDragDropStateWithRenders'
import { useEventBusDispatch } from '@/app/features/eventBus'
import { Shortcut, ShortcutPriorities, useShortcut } from '@/app/hooks/useShortcut/useShortcut'
import { TimelineTrack } from '@/app/views/world/views/timeline/hooks/useEventTracks'
import { getWorldIdState } from '@/app/views/world/WorldSliceSelectors'
import Tooltip from '@/ui-lib/components/Tooltip'

import { timelineSlice } from '../../TimelineSlice'
import { DeleteTrackButton } from './DeleteTrackButton'

type Props = {
	track: TimelineTrack
	draggableRef?: React.RefObject<HTMLDivElement | null>
	receiverRef?: React.RefObject<HTMLTableRowElement | null>
}

export const TimelineTracksMenuItem = memo(TimelineTracksMenuItemComponent)

function TimelineTracksMenuItemComponent({ track, draggableRef, receiverRef }: Props) {
	const worldId = useSelector(getWorldIdState)

	const [name, setName] = useState(track.name)
	const [editing, setEditing] = useState(false)

	const { updateTrack: updateTrackOptimistic } = timelineSlice.actions
	const dispatch = useDispatch()

	useShortcut(
		[Shortcut.Enter, Shortcut.CtrlEnter],
		() => {
			handleBlur()
		},
		editing && ShortcutPriorities.InputField,
	)
	useShortcut(
		[Shortcut.Escape],
		() => {
			setEditing(false)
			setName(track.name)
		},
		editing && ShortcutPriorities.InputField,
	)

	const scrollTimelineTo = useEventBusDispatch['timeline/requestScrollTo']()

	const [updateTrack] = useUpdateWorldEventTrackMutation()

	const onToggleVisibility = useCallback(
		async (track: TimelineTrack) => {
			await updateTrack({
				worldId,
				trackId: track.id,
				body: {
					visible: !track.visible,
				},
			})
		},
		[updateTrack, worldId],
	)

	const handleStartEdit = useCallback(() => {
		setEditing(true)
	}, [])

	const handleUpdate = useCallback((value: string) => {
		setName(value)
	}, [])

	const handleBlur = useCallback(async () => {
		setEditing(false)
		dispatch(updateTrackOptimistic({ trackId: track.id, name: name.trim() }))
		await updateTrack({
			worldId,
			trackId: track.id,
			body: {
				name: name.trim(),
			},
		})
	}, [dispatch, name, track.id, updateTrack, updateTrackOptimistic, worldId])

	const { state: draggingState } = useDragDropStateWithRenders()
	const { isDragging, trackDragState } = useMemo(() => {
		if (IsDragDropStateOfType(draggingState, 'timelineTrack')) {
			return { isDragging: true, trackDragState: draggingState }
		}
		return { isDragging: false, trackDragState: null }
	}, [draggingState])

	return (
		<TableRow
			ref={receiverRef}
			key={track.id}
			sx={{
				'&:last-child td, &:last-child th': { border: 0 },
				height: '64px',
				...(isDragging &&
					trackDragState?.params.track.id !== track.id && {
						'&:hover': {
							backgroundColor: 'rgba(0, 0, 0, 0.2)',
						},
					}),
			}}
		>
			<TableCell sx={{ margin: 0, padding: 0, minWidth: 2 }}>
				<Stack
					ref={draggableRef}
					sx={{
						alignItems: 'center',
						justifyContent: 'center',
						color: 'text.secondary',
						padding: '16px 0',
						cursor: 'grab',
						'&:active': { cursor: 'grabbing' },
					}}
				>
					{track.id !== 'default' && <DragIndicatorIcon />}
				</Stack>
			</TableCell>
			<TableCell width={'1px'} sx={{ margin: 0, padding: 1, paddingRight: 0, minWidth: 58 }}>
				{track.id !== 'default' && (
					<Switch checked={track.visible} disabled={isDragging} onChange={() => onToggleVisibility(track)} />
				)}
			</TableCell>
			<TableCell sx={{ padding: 0, width: '50%' }}>
				{!editing && (
					<Box sx={{ width: '100%', height: '100%' }}>
						<Button
							variant="text"
							sx={{ margin: 0, width: 1, justifyContent: 'flex-start', height: 1 }}
							onClick={handleStartEdit}
							disabled={isDragging || track.id === 'default'}
							startIcon={track.id === 'default' ? null : <EditIcon fontSize="small" />}
						>
							<Typography variant="body2" noWrap>
								{track.name}
							</Typography>
						</Button>
					</Box>
				)}
				{editing && (
					<Stack direction="row" gap={0.5} sx={{ flex: 1, marginTop: '4px', marginLeft: '8px' }}>
						<Box
							sx={{
								width: '24px',
								marginLeft: '-4px',
								marginTop: '1px',
								color: 'text.secondary',
							}}
						>
							<EditIcon fontSize="small" />
						</Box>
						<Input
							autoFocus
							size="small"
							placeholder="Label (e.g. January)"
							value={name}
							onChange={(e) => handleUpdate(e.target.value)}
							onBlur={handleBlur}
							sx={{ fontSize: '0.875rem', width: 1, marginLeft: '1px' }}
						/>
					</Stack>
				)}
			</TableCell>
			<TableCell>
				<Stack direction="row" gap={1}>
					{track.events.length > 0 && (
						<Tooltip title="Scroll to the earliest event" disableInteractive enterDelay={500}>
							<Button
								color="secondary"
								variant="outlined"
								disabled={isDragging}
								onClick={() => {
									scrollTimelineTo({
										timestamp: track.events[track.events.length - 1].markerPosition,
									})
								}}
								sx={{
									minWidth: '32px',
								}}
							>
								<FirstPageIcon />
							</Button>
						</Tooltip>
					)}
					{track.events.length > 0 && (
						<Tooltip title="Scroll to the latest event" disableInteractive enterDelay={500}>
							<Button
								color="secondary"
								variant="outlined"
								disabled={isDragging}
								onClick={() => {
									scrollTimelineTo({
										timestamp: track.events[0].markerPosition,
									})
								}}
								sx={{
									minWidth: '32px',
								}}
							>
								<LastPageIcon />
							</Button>
						</Tooltip>
					)}
				</Stack>
			</TableCell>
			<TableCell>
				{track.id !== 'default' && (
					<DeleteTrackButton trackId={track.id} trackName={track.name} disabled={isDragging} />
				)}
			</TableCell>
		</TableRow>
	)
}
