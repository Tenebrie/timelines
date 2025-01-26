import Delete from '@mui/icons-material/Delete'
import Edit from '@mui/icons-material/Edit'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import { useDispatch } from 'react-redux'

import { GetWorldsApiResponse } from '@/api/worldListApi'
import { useWorldRouter, worldRoutes } from '@/router/routes/featureRoutes/worldRoutes'
import {
	useWorldTimelineRouter,
	worldTimelineRoutes,
} from '@/router/routes/featureRoutes/worldTimelineRoutes'
import { QueryParams } from '@/router/routes/QueryParams'

import { OutlinedContainer } from '../../components/OutlinedContainer'
import { TrunkatedSpan } from '../../components/TrunkatedTypography'
import { worldSlice } from '../world/reducer'
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
	const { navigateTo } = useWorldRouter()
	const { navigateTo: navigateToTimeline } = useWorldTimelineRouter()

	const { unloadWorld } = worldSlice.actions
	const { openWorldWizardModal, openDeleteWorldModal } = worldListSlice.actions
	const dispatch = useDispatch()

	const onCreate = async () => {
		dispatch(openWorldWizardModal())
	}

	const onLoad = (id: string) => {
		const world = worlds.find((w) => w.id === id)
		if (!world) {
			return
		}

		dispatch(unloadWorld())
		navigateToTimeline({
			target: worldTimelineRoutes.outliner,
			args: {
				worldId: id,
			},
			query: {
				[QueryParams.SELECTED_TIME]: world.timeOrigin,
			},
		})
	}

	const onEdit = (id: string) => {
		navigateTo({
			target: worldRoutes.settings,
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
		<OutlinedContainer style={{ maxWidth: 600, minWidth: 400 }} label={label}>
			{worlds.map((world) => (
				<Stack direction="row" justifyContent="space-between" key={world.id}>
					<Tooltip title={world.name} enterDelay={1000} arrow>
						<Button
							fullWidth={true}
							onClick={() => onLoad(world.id)}
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
