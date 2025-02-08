import Delete from '@mui/icons-material/Delete'
import Edit from '@mui/icons-material/Edit'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import { useNavigate } from '@tanstack/react-router'
import { useDispatch } from 'react-redux'

import { GetWorldsApiResponse } from '@/api/worldListApi'

import { OutlinedContainer } from '../../components/OutlinedContainer'
import { TrunkatedSpan } from '../../components/TrunkatedTypography'
import { worldSlice } from '../world/reducer'
import { WorldBrief } from '../worldTimeline/types'
import { WorldListEmptyState } from './components/WorldListEmptyState'
import { worldListSlice } from './reducer'

type Props = {
	worlds:
		| GetWorldsApiResponse['ownedWorlds']
		| GetWorldsApiResponse['contributableWorlds']
		| GetWorldsApiResponse['visibleWorlds']
	label: string
	showActions?: boolean
	showEmptyState?: boolean
	showCreateButton?: boolean
}

export const WorldListSection = ({ worlds, label, showActions, showEmptyState, showCreateButton }: Props) => {
	const navigate = useNavigate()

	const { unloadWorld } = worldSlice.actions
	const { openWorldWizardModal, openDeleteWorldModal } = worldListSlice.actions
	const dispatch = useDispatch()

	const onCreate = async () => {
		dispatch(openWorldWizardModal())
	}

	const onLoad = (world: WorldBrief) => {
		dispatch(unloadWorld())
		navigate({
			to: '/world/$worldId/timeline/outliner',
			params: {
				worldId: world.id,
			},
			search: {
				time: parseInt(world.timeOrigin),
			},
		})
	}

	const onEdit = (id: string) => {
		navigate({
			to: `/world/${id}/settings`,
		})
	}

	const onDelete = (world: { id: string; name: string }) => {
		dispatch(openDeleteWorldModal(world))
	}

	if (worlds.length === 0 && showEmptyState) {
		return <WorldListEmptyState label={label} onCreate={onCreate} />
	} else if (worlds.length === 0) {
		return <></>
	}

	return (
		<OutlinedContainer style={{ maxWidth: 600, minWidth: 400 }} label={label}>
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
			{showCreateButton && <Button onClick={onCreate}>Create new world...</Button>}
		</OutlinedContainer>
	)
}
