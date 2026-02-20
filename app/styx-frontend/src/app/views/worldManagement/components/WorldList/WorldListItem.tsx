import { WorldBrief } from '@api/types/worldTypes'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import GroupIcon from '@mui/icons-material/Group'
import ButtonBase from '@mui/material/ButtonBase'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'

import { NavigationLink } from '@/app/components/NavigationLink'
import { useModal } from '@/app/features/modals/ModalsSlice'
import { formatTimeAgo } from '@/app/views/home/utils/formatTimeAgo'
import { useStableNavigate } from '@/router-utils/hooks/useStableNavigate'

type Props = {
	world: WorldBrief
	showActions?: boolean
}

export function WorldListItem({ world, showActions }: Props) {
	const isShared = world.accessMode !== 'Private'
	const lastUpdated = formatTimeAgo(new Date(world.updatedAt))

	const navigate = useStableNavigate()

	const { open: openDeleteWorldModal } = useModal('deleteWorldModal')

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
		<NavigationLink
			to="/world/$worldId/timeline"
			params={{ worldId: world.id }}
			search={(prev) => ({
				...prev,
				time: parseInt(world.timeOrigin),
			})}
		>
			<ButtonBase
				key={world.id}
				component="div"
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
				aria-label={`Load world "${world.name}"`}
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
							<Stack gap={0.5}>
								{world.description && (
									<Typography variant="body2" color="text.secondary">
										{world.description}
									</Typography>
								)}
								<Typography variant="body2" color="text.secondary">
									Updated {lastUpdated} | {world.calendars[0]?.name ?? ''}
								</Typography>
							</Stack>
							{isShared && (
								<Stack direction="row" alignItems="center" gap={0.5}>
									<GroupIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
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
									aria-label={`Edit world "${world.name}" button`}
									onClick={(e) => {
										e.stopPropagation()
										onEdit(world.id)
									}}
									color="secondary"
								>
									<EditIcon fontSize="small" />
								</IconButton>
							</Tooltip>
							<Tooltip title="Delete world" disableInteractive enterDelay={500}>
								<IconButton
									size="small"
									aria-label={`Delete world "${world.name}" button`}
									onClick={(e) => {
										e.stopPropagation()
										onDelete(world)
									}}
									color="secondary"
								>
									<DeleteIcon fontSize="small" />
								</IconButton>
							</Tooltip>
						</Stack>
					)}
				</Stack>
			</ButtonBase>
		</NavigationLink>
	)
}
