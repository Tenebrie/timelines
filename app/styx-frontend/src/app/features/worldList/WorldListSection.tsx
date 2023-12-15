import { Delete, Edit } from '@mui/icons-material'
import { Button, Stack, Tooltip } from '@mui/material'
import { useDispatch } from 'react-redux'

import { GetWorldsApiResponse } from '../../../api/rheaApi'
import { OverlayingLabel } from '../../components/OverlayingLabel'
import { TrunkatedSpan } from '../../components/TrunkatedTypography'
import { useHomeRouter, useWorldRouter } from '../world/router'
import { WorldListEmptyState } from './components/WorldListEmptyState'
import { worldListSlice } from './reducer'
import { WorldsUnit } from './styles'

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
	const { navigateToWorld: navigateToWorldRoot } = useWorldRouter()
	const { navigateToWorldDetails } = useHomeRouter()

	const dispatch = useDispatch()
	const { openWorldWizardModal, openDeleteWorldModal } = worldListSlice.actions

	const onCreate = async () => {
		dispatch(openWorldWizardModal())
	}

	const onLoad = (id: string) => {
		navigateToWorldRoot(id)
	}

	const onEdit = (id: string) => {
		navigateToWorldDetails({ worldId: id })
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
		<WorldsUnit style={{ maxWidth: 600, minWidth: 400 }}>
			<OverlayingLabel>{label}</OverlayingLabel>
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
		</WorldsUnit>
	)
}
