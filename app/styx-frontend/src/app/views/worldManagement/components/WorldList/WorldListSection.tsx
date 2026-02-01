import { WorldBrief } from '@api/types/worldTypes'
import Add from '@mui/icons-material/Add'
import Delete from '@mui/icons-material/Delete'
import Edit from '@mui/icons-material/Edit'
import Group from '@mui/icons-material/Group'
import Public from '@mui/icons-material/Public'
import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useDispatch } from 'react-redux'

import { GetWorldsApiResponse } from '@/api/worldListApi'
import { useModal } from '@/app/features/modals/ModalsSlice'
import { formatTimeAgo } from '@/app/views/home/utils/formatTimeAgo'
import { worldSlice } from '@/app/views/world/WorldSlice'
import { useStableNavigate } from '@/router-utils/hooks/useStableNavigate'

type Props = {
	worlds:
		| GetWorldsApiResponse['ownedWorlds']
		| GetWorldsApiResponse['contributableWorlds']
		| GetWorldsApiResponse['visibleWorlds']
	label: string
	showActions?: boolean
	showCreateButton?: boolean
}

export const WorldListSection = ({ worlds, label, showActions, showCreateButton }: Props) => {
	const navigate = useStableNavigate()

	const { unloadWorld } = worldSlice.actions
	const { open: openWorldWizardModal } = useModal('worldWizardModal')
	const { open: openDeleteWorldModal } = useModal('deleteWorldModal')
	const dispatch = useDispatch()

	const onLoad = (world: WorldBrief) => {
		dispatch(unloadWorld())
		navigate({
			to: '/world/$worldId/timeline',
			params: {
				worldId: world.id,
			},
			search: (prev) => ({
				...prev,
				time: parseInt(world.timeOrigin),
			}),
		})
	}

	const onEdit = (id: string) => {
		navigate({
			to: `/world/${id}/settings`,
			search: true,
		})
	}

	const onDelete = (world: { id: string; name: string }) => {
		openDeleteWorldModal({ worldId: world.id, worldName: world.name })
	}

	return (
		<Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
			<Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
				<Stack direction="row" alignItems="center" gap={2}>
					<Box
						sx={{
							p: 1,
							borderRadius: 1.5,
							bgcolor: 'primary.main',
							color: 'primary.contrastText',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
						}}
					>
						<Public fontSize="small" />
					</Box>
					<Typography variant="h6" fontWeight="bold">
						{label}
					</Typography>
				</Stack>
				{showCreateButton && (
					<IconButton
						size="small"
						onClick={() => openWorldWizardModal({})}
						aria-label="Create new world"
						sx={{
							bgcolor: 'action.hover',
							'&:hover': {
								bgcolor: 'action.selected',
							},
						}}
					>
						<Add />
					</IconButton>
				)}
			</Stack>
			<Divider sx={{ mb: 2 }} />
			<Stack gap={0.5}>
				{worlds.map((world) => {
					// TODO: Replace with actual data from API when available
					const isShared = world.accessMode !== 'Private'
					const lastUpdated = formatTimeAgo(new Date(world.updatedAt))

					return (
						<ButtonBase
							key={world.id}
							onClick={() => onLoad(world)}
							sx={{
								width: '100%',
								borderRadius: 1,
								p: 1.5,
								justifyContent: 'flex-start',
								textAlign: 'left',
								'&:hover:not(:has(.MuiIconButton-root:hover))': {
									bgcolor: 'action.hover',
								},
							}}
							data-hj-suppress
						>
							<Stack direction="row" alignItems="center" justifyContent="space-between" width="100%" gap={1}>
								<Stack flex={1} minWidth={0}>
									<Typography
										variant="body1"
										sx={{
											overflow: 'hidden',
											textOverflow: 'ellipsis',
											whiteSpace: 'nowrap',
										}}
									>
										{world.name}
									</Typography>
									<Stack direction="row" alignItems="center" gap={1}>
										<Typography variant="body2" color="text.secondary">
											Updated {lastUpdated}
										</Typography>
										{isShared && (
											<Stack direction="row" alignItems="center" gap={0.5}>
												<Group sx={{ fontSize: 14, color: 'text.secondary' }} />
												<Typography variant="body2" color="text.secondary">
													Shared
												</Typography>
											</Stack>
										)}
									</Stack>
								</Stack>
								{showActions && (
									<Stack
										direction="row"
										gap={0.5}
										onClick={(e) => e.stopPropagation()}
										onMouseDown={(e) => e.stopPropagation()}
										sx={{ flexShrink: 0 }}
									>
										<Tooltip title="Edit settings" disableInteractive enterDelay={500}>
											<IconButton
												size="small"
												aria-label="Edit world button"
												onClick={(e) => {
													e.stopPropagation()
													onEdit(world.id)
												}}
											>
												<Edit fontSize="small" />
											</IconButton>
										</Tooltip>
										<Tooltip title="Delete world" disableInteractive enterDelay={500}>
											<IconButton
												size="small"
												aria-label="Delete world button"
												onClick={(e) => {
													e.stopPropagation()
													onDelete(world)
												}}
												color="error"
											>
												<Delete fontSize="small" />
											</IconButton>
										</Tooltip>
									</Stack>
								)}
							</Stack>
						</ButtonBase>
					)
				})}
				{worlds.length === 0 && (
					<Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
						No worlds yet. Click the + button to create one!
					</Typography>
				)}
			</Stack>
		</Paper>
	)
}
