import FirstPageIcon from '@mui/icons-material/FirstPage'
import LastPageIcon from '@mui/icons-material/LastPage'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import { memo, useCallback } from 'react'
import { useSelector } from 'react-redux'

import { useUpdateWorldEventTrackMutation } from '@/api/worldEventTracksApi'
import { useEventBusDispatch } from '@/app/features/eventBus'
import { useModal } from '@/app/features/modals/reducer'
import { getTimelineState, getWorldIdState } from '@/app/features/world/selectors'
import { useBrowserSpecificScrollbars } from '@/app/hooks/useBrowserSpecificScrollbars'
import { parseApiResponse } from '@/app/utils/parseApiResponse'

import { TimelineTrack } from '../Timeline/components/TimelineTracks/hooks/useEventTracks'

export const EventTracksMenu = memo(EventTracksMenuComponent)

function EventTracksMenuComponent() {
	const worldId = useSelector(getWorldIdState)
	const { allTracks } = useSelector(getTimelineState, (a, b) => a.allTracks === b.allTracks)
	const { open: openEventTrackEdit } = useModal('eventTrackEdit')
	const { open: openEventTrackWizard } = useModal('eventTrackWizard')

	const scrollTimelineTo = useEventBusDispatch({ event: 'scrollTimelineTo' })

	const [updateTrack] = useUpdateWorldEventTrackMutation()

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
		},
		[openEventTrackEdit],
	)

	const onCreate = useCallback(() => {
		openEventTrackWizard({})
	}, [openEventTrackWizard])

	return (
		<Stack
			sx={{
				padding: '0 16px 0 16px',
				marginBottom: 3,
				overflowX: 'hidden',
				overflowY: 'scroll',
				...useBrowserSpecificScrollbars(),
			}}
		>
			<Stack
				gap={1}
				direction="row"
				alignContent="center"
				width="100%"
				sx={{ height: '64px', flexShrink: 0 }}
				data-testid="EventTitle"
			>
				<Stack
					direction="row"
					alignItems={'center'}
					justifyContent="space-between"
					width="100%"
					sx={{ padding: '0 8px', flexGrow: 1, marginTop: '16px' }}
				>
					<Typography variant="h6" noWrap>
						{'Event tracks'}
					</Typography>
					<Button onClick={onCreate}>Create new track...</Button>
				</Stack>
			</Stack>
			<Divider />
			<Table>
				<TableBody>
					{allTracks.map((track) => (
						<TableRow
							key={track.id}
							sx={{
								'&:last-child td, &:last-child th': { border: 0 },
							}}
						>
							<TableCell width={'1px'} sx={{ margin: 0, padding: 1, paddingRight: 0, minWidth: 58 }}>
								{track.id !== 'default' && (
									<Switch checked={track.visible} onChange={() => onToggleVisibility(track)} />
								)}
							</TableCell>
							<TableCell>
								<Button
									variant="outlined"
									onClick={() => onClick(track)}
									disabled={track.id === 'default'}
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
											sx={{
												minWidth: '32px',
											}}
										>
											<FirstPageIcon />
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
											sx={{
												minWidth: '32px',
											}}
										>
											<LastPageIcon />
										</Button>
									)}
								</Stack>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</Stack>
	)
}
