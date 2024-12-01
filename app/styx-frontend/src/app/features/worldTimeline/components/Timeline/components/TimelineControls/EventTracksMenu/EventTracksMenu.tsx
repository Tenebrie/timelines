import { Leaderboard } from '@mui/icons-material'
import {
	Button,
	Checkbox,
	Paper,
	Popover,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
} from '@mui/material'
import { bindPopover, bindTrigger, usePopupState } from 'material-ui-popup-state/hooks'
import { useCallback } from 'react'
import { useSelector } from 'react-redux'

import { useUpdateWorldEventTrackMutation } from '@/api/worldEventTracksApi'
import { useModal } from '@/app/features/modals/reducer'
import { useWorldTime } from '@/app/features/time/hooks/useWorldTime'
import { getWorldIdState } from '@/app/features/worldTimeline/selectors'
import { parseApiResponse } from '@/app/utils/parseApiResponse'

import useEventTracks, { TimelineTrack } from '../../TimelineTracks/hooks/useEventTracks'

type Props = {
	onNavigateToTime: (timestamp: number) => void
}

export const EventTracksMenu = ({ onNavigateToTime }: Props) => {
	const worldId = useSelector(getWorldIdState)
	const tracks = useEventTracks({ showHidden: true })
	const displayedTracks = tracks.filter((t) => t.id !== 'default')
	const { timeToLabel } = useWorldTime()
	const { open: openEventTrackEdit } = useModal('eventTrackEdit')

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
				variant="outlined"
				startIcon={<Leaderboard style={{ transform: 'rotate(90deg)' }} />}
				{...bindTrigger(popupState)}
			>
				Event tracks
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
														onNavigateToTime(track.events[track.events.length - 1].markerPosition)
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
														onNavigateToTime(track.events[0].markerPosition)
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
