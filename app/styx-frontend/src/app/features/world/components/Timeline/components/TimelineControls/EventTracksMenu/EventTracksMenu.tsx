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

import { useWorldRouter } from '../../../../../../../../router/routes/worldRoutes'
import { useWorldTime } from '../../../../../../time/hooks/useWorldTime'
import useEventTracks from '../../TimelineTracks/hooks/useEventTracks'

type Props = {
	onNavigateToTime: (timestamp: number) => void
}

export const EventTracksMenu = ({ onNavigateToTime }: Props) => {
	const tracks = useEventTracks()
	const displayedTracks = tracks.filter((t) => t.id !== 'default')
	const { timeToLabel } = useWorldTime()
	const { navigateToOutliner } = useWorldRouter()

	const popupState = usePopupState({ variant: 'popover', popupId: 'tracksMenu' })

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
						vertical: 'bottom',
						horizontal: 'center',
					}}
					transformOrigin={{
						vertical: 'top',
						horizontal: 'center',
					}}
				>
					<TableContainer component={Paper} sx={{ width: 1000, maxHeight: 300 }}>
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
											<Checkbox checked={false} />
										</TableCell>
										<TableCell>{track.position}</TableCell>
										<TableCell>{track.name}</TableCell>
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
