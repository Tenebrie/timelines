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

import { useUpdateWorldEventTrackMutation } from '../../../../../../../../api/rheaApi'
import { useWorldRouter } from '../../../../../../../../router/routes/worldRoutes'
import { parseApiResponse } from '../../../../../../../utils/parseApiResponse'
import { useModal } from '../../../../../../modals/reducer'
import { useWorldTime } from '../../../../../../time/hooks/useWorldTime'
import { getWorldState } from '../../../../../selectors'
import useEventTracks, { TimelineTrack } from '../../TimelineTracks/hooks/useEventTracks'

type Props = {
	onNavigateToTime: (timestamp: number) => void
}

export const EventTracksMenu = ({ onNavigateToTime }: Props) => {
	const { id: worldId } = useSelector(getWorldState)
	const tracks = useEventTracks({ showHidden: true })
	const displayedTracks = tracks.filter((t) => t.id !== 'default')
	const { timeToLabel } = useWorldTime()
	const { navigateToOutliner } = useWorldRouter()
	const { open: openEventTrackEdit } = useModal('eventTrackEdit')

	const [updateTrack] = useUpdateWorldEventTrackMutation()

	const popupState = usePopupState({ variant: 'popover', popupId: 'tracksMenu' })

	const onToggleVisibility = useCallback(
		async (track: TimelineTrack) => {
			const { error } = parseApiResponse(
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
														onNavigateToTime(track.events[track.events.length - 1].timestamp)
														navigateToOutliner(track.events[track.events.length - 1].timestamp)
													}}
												>
													{timeToLabel(track.events[track.events.length - 1].timestamp)}
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
														onNavigateToTime(track.events[0].timestamp)
														navigateToOutliner(track.events[0].timestamp)
													}}
												>
													{timeToLabel(track.events[0].timestamp)}
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
