import { Delete, Edit } from '@mui/icons-material'
import { Button, Stack, Tooltip } from '@mui/material'
import { useDispatch } from 'react-redux'

import { GetWorldsApiResponse } from '../../../api/rheaApi'
import { homeRoutes } from '../../../router/routes/homeRoutes'
import { useRouter } from '../../../router/routes/routes'
import { worldRoutes } from '../../../router/routes/worldRoutes'
import { OutlinedContainer } from '../../components/OutlinedContainer'
import { TrunkatedSpan } from '../../components/TrunkatedTypography'
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
	const { navigateTo } = useRouter()

	const dispatch = useDispatch()
	const { openWorldWizardModal, openDeleteWorldModal } = worldListSlice.actions

	const onCreate = async () => {
		dispatch(openWorldWizardModal())
	}

	const onLoad = (id: string) => {
		navigateTo({
			target: worldRoutes.root,
			args: {
				worldId: id,
			},
		})
	}

	const onEdit = (id: string) => {
		navigateTo({
			target: homeRoutes.worldDetails,
			args: { worldId: id },
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
		<OutlinedContainer style={{ maxWidth: 600, minWidth: 400 }} label={label} fullHeight>
			<Stack spacing={1} minWidth={256}>
				{worlds.map((world) => (
					<Stack direction="row" justifyContent="space-between" key={world.id}>
						<Tooltip title={world.name} enterDelay={1000} arrow>
							<Button
								fullWidth={true}
								onClick={() => onLoad(world.id)}
								style={{ textAlign: 'start', lineBreak: 'anywhere' }}
								data-hj-suppress
							>
								<TrunkatedSpan lines={1} style={{ width: '100%' }}>
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
			</Stack>
		</OutlinedContainer>
	)
}