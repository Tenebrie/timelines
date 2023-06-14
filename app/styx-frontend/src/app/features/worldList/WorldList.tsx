import { Delete } from '@mui/icons-material'
import { Button, Container, Stack, Tooltip } from '@mui/material'
import { useDispatch } from 'react-redux'

import { useGetWorldsQuery } from '../../../api/rheaApi'
import { BlockingSpinner } from '../../components/BlockingSpinner'
import { OverlayingLabel } from '../../components/OverlayingLabel'
import { TrunkatedSpan } from '../../components/TrunkatedTypography'
import { useWorldRouter } from '../world/router'
import { DeleteWorldModal } from './components/DeleteWorldModal'
import { WorldListEmptyState } from './components/WorldListEmptyState'
import { worldListSlice } from './reducer'
import { WorldsUnit } from './styles'
import { WorldWizardModal } from './WorldWizard/WorldWizardModal'

export const WorldList = () => {
	const { data, isFetching } = useGetWorldsQuery()

	const { navigateToWorld: navigateToWorldRoot } = useWorldRouter()

	const dispatch = useDispatch()
	const { openWorldWizardModal, openDeleteWorldModal } = worldListSlice.actions

	const onCreate = async () => {
		dispatch(openWorldWizardModal())
	}

	const onLoad = (id: string) => {
		navigateToWorldRoot(id)
	}

	const onDelete = (world: { id: string; name: string }) => {
		dispatch(openDeleteWorldModal(world))
	}

	return (
		<Container style={{ position: 'relative' }}>
			{!!data && (
				<WorldsUnit style={{ maxWidth: 350, minWidth: 300 }}>
					<OverlayingLabel>Your worlds</OverlayingLabel>
					<Stack spacing={1} minWidth={256}>
						{data.map((world) => (
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
								<Button onClick={() => onDelete(world)}>
									<Delete />
								</Button>
							</Stack>
						))}
						{data.length === 0 && <WorldListEmptyState />}
						<Button onClick={onCreate}>Create new world...</Button>
					</Stack>
				</WorldsUnit>
			)}
			<BlockingSpinner visible={isFetching} />
			<WorldWizardModal />
			<DeleteWorldModal />
		</Container>
	)
}
