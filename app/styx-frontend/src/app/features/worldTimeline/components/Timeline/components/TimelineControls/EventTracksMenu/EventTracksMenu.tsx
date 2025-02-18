import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import { usePopupState } from 'material-ui-popup-state/hooks'
import { memo, useCallback } from 'react'
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

export const EventTracksMenu = memo(EventTracksMenuComponent)

function EventTracksMenuComponent({ size }: Props) {
	const worldId = useSelector(getWorldIdState)
	const { allTracks } = useSelector(getTimelineState, (a, b) => a.allTracks === b.allTracks)
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
		<TableContainer sx={{ padding: '0 16px 24px 16px', marginBottom: 3 }}>
			<Table>
				<TableHead>
					<TableRow>
						<TableCell></TableCell>
						<TableCell>Name</TableCell>
						<TableCell>Navigation</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{allTracks.map((track) => (
						<TableRow key={track.id}>
							<TableCell width={'1px'} sx={{ margin: 0, padding: 1, paddingRight: 0 }}>
								<Checkbox
									checked={track.visible}
									sx={{ padding: 0 }}
									onChange={() => onToggleVisibility(track)}
								/>
							</TableCell>
							<TableCell>
								<Button
									variant="outlined"
									onClick={() => onClick(track)}
									sx={{ display: 'flex', justifyContent: 'flex-start', width: '220px' }}
								>
									<span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
										{track.name}
									</span>
								</Button>
							</TableCell>
							<TableCell>
								<Stack direction="row" gap={1}>
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
											&lt;--
										</Button>
									)}
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
											--&gt;
										</Button>
									)}
								</Stack>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</TableContainer>
	)
}
