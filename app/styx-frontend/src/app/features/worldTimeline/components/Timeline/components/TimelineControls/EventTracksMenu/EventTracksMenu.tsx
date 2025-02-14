import Leaderboard from '@mui/icons-material/Leaderboard'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import Paper from '@mui/material/Paper'
import Popover from '@mui/material/Popover'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import { bindPopover, bindTrigger, usePopupState } from 'material-ui-popup-state/hooks'
import { useCallback } from 'react'
import { useSelector } from 'react-redux'

import { useUpdateWorldEventTrackMutation } from '@/api/worldEventTracksApi'
import { useEventBusDispatch } from '@/app/features/eventBus'
import { useModal } from '@/app/features/modals/reducer'
import { useWorldTime } from '@/app/features/time/hooks/useWorldTime'
import { getTimelineState, getWorldIdState } from '@/app/features/world/selectors'
import { parseApiResponse } from '@/app/utils/parseApiResponse'

import { TimelineTrack } from '../../TimelineTracks/hooks/useEventTracks'

type Props = {
	size?: 'small'
}

export const EventTracksMenu = ({ size }: Props) => {
	const worldId = useSelector(getWorldIdState)
	const { tracks } = useSelector(getTimelineState, (a, b) => a.tracks === b.tracks)
	const displayedTracks = tracks.filter((t) => t.id !== 'default')
	const { timeToLabel } = useWorldTime()
	const { open: openEventTrackEdit } = useModal('eventTrackEdit')

	const scrollTimelineTo = useEventBusDispatch({ event: 'scrollTimelineTo' })

	const [updateTrack] = useUpdateWorldEventTrackMutation()

	const popupState = usePopupState({ variant: 'popover', popupId: 'tracksMenu' })

	const onToggleVisibility = useCallback(
		async (track: TimelineTrack) => {
			parseApiResponse(
				await updateTrack({
					worldId,
					trackId: track.id,
					body: {
						visible: !track.visible,
					},
				}),
			)
		},
		[updateTrack, worldId],
	)

	const onClick = useCallback(
		(track: TimelineTrack) => {
			openEventTrackEdit({ target: track.baseModel })
			popupState.close()
		},
		[openEventTrackEdit, popupState],
	)

	return (
		<>
			<Button
				color="primary"
				startIcon={size === 'small' ? null : <Leaderboard style={{ transform: 'rotate(90deg)' }} />}
				sx={{ height: size === 'small' ? 64 : undefined }}
				{...bindTrigger(popupState)}
			>
				{size === 'small' ? <Leaderboard style={{ transform: 'rotate(90deg)' }} /> : 'Event tracks'}
			</Button>
			{tracks && (
				<Popover
					{...bindPopover(popupState)}
					anchorOrigin={{
						vertical: 'top',
						horizontal: 'left',
					}}
					transformOrigin={{
						vertical: 'bottom',
						horizontal: 'right',
					}}
				>
					<TableContainer component={Paper} sx={{ width: 1000, maxHeight: 500 }}>
						<Table>
							<TableHead>
								<TableRow>
									<TableCell>Displayed</TableCell>
									<TableCell>Index</TableCell>
									<TableCell>Name</TableCell>
									<TableCell>First event</TableCell>
									<TableCell>Last event</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{displayedTracks.map((track) => (
									<TableRow key={track.id}>
										<TableCell>
											<Checkbox checked={track.visible} onChange={() => onToggleVisibility(track)} />
										</TableCell>
										<TableCell>{track.position}</TableCell>
										<TableCell>
											<Button onClick={() => onClick(track)}>{track.name}</Button>
										</TableCell>
										<TableCell>
											{track.events.length > 0 && (
												<Button
													color="secondary"
													variant="outlined"
													onClick={() => {
														scrollTimelineTo({
															timestamp: track.events[track.events.length - 1].markerPosition,
														})
													}}
												>
													{timeToLabel(track.events[track.events.length - 1].markerPosition)}
												</Button>
											)}
											{track.events.length === 0 && '-'}
										</TableCell>
										<TableCell>
											{track.events.length > 0 && (
												<Button
													color="secondary"
													variant="outlined"
													onClick={() => {
														scrollTimelineTo({
															timestamp: track.events[0].markerPosition,
														})
													}}
												>
													{timeToLabel(track.events[0].markerPosition)}
												</Button>
											)}
											{track.events.length === 0 && '-'}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</TableContainer>
				</Popover>
			)}
		</>
	)
}
