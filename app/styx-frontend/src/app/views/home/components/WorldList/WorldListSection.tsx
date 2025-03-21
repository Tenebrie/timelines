import { WorldBrief } from '@api/types/worldTypes'
import Delete from '@mui/icons-material/Delete'
import Edit from '@mui/icons-material/Edit'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import { useNavigate } from '@tanstack/react-router'
import { useDispatch } from 'react-redux'

import { GetWorldsApiResponse } from '@/api/worldListApi'
import { OutlinedContainer } from '@/app/components/OutlinedContainer'
import { TrunkatedSpan } from '@/app/components/TrunkatedTypography'
import { useModal } from '@/app/features/modals/ModalsSlice'
import { worldSlice } from '@/app/views/world/WorldSlice'

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
	const navigate = useNavigate()

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
		<OutlinedContainer style={{ maxWidth: 600, minWidth: 400, borderRadius: 8 }} label={label}>
			{worlds.map((world) => (
				<Stack direction="row" justifyContent="space-between" key={world.id}>
					<Tooltip title={world.name} enterDelay={1000} arrow>
						<Button
							fullWidth={true}
							onClick={() => onLoad(world)}
							style={{ textAlign: 'start', lineBreak: 'anywhere' }}
							data-hj-suppress
						>
							<TrunkatedSpan $lines={1} style={{ width: '100%' }}>
								- {world.name}
							</TrunkatedSpan>
						</Button>
					</Tooltip>
					{showActions && (
						<Stack direction="row" gap={0.5}>
							<Button onClick={() => onEdit(world.id)}>
								<Edit />
							</Button>
							<Button onClick={() => onDelete(world)}>
								<Delete />
							</Button>
						</Stack>
					)}
				</Stack>
			))}
			{showCreateButton && <Button onClick={() => openWorldWizardModal({})}>Create new world...</Button>}
		</OutlinedContainer>
	)
}
