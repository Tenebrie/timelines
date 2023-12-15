import { Delete, Edit } from '@mui/icons-material'
import { Button, Container, Stack, Tooltip } from '@mui/material'
import { useDispatch } from 'react-redux'

import { BlockingSpinner } from '../../components/BlockingSpinner'
import { OverlayingLabel } from '../../components/OverlayingLabel'
import { TrunkatedSpan } from '../../components/TrunkatedTypography'
import { useHomeRouter, useWorldRouter } from '../world/router'
import { DeleteWorldModal } from './components/DeleteWorldModal'
import { ShareWorldModal } from './components/WorldDetails/components/ShareWorldModal'
import { WorldListEmptyState } from './components/WorldListEmptyState'
import { WorldWizardModal } from './components/WorldWizard/WorldWizardModal'
import { useWorldListData } from './hooks/useWorldListData'
import { worldListSlice } from './reducer'
import { WorldsUnit } from './styles'

export const WorldList = () => {
	const { isFetching, isReady, ownedWorlds, contributableWorlds, visibleWorlds } = useWorldListData()

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

	return (
		<Container style={{ position: 'relative' }}>
			{isReady && (
				<Stack gap={4}>
					<WorldsUnit style={{ maxWidth: 600, minWidth: 400 }}>
						<OverlayingLabel>Your worlds</OverlayingLabel>
						<Stack spacing={1} minWidth={256}>
							{ownedWorlds.map((world) => (
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
									<Stack direction="row" gap={0.5}>
										<Button onClick={() => onEdit(world.id)}>
											<Edit />
										</Button>
										<Button onClick={() => onDelete(world)}>
											<Delete />
										</Button>
									</Stack>
								</Stack>
							))}
							{ownedWorlds.length === 0 && <WorldListEmptyState />}
							<Button onClick={onCreate}>Create new world...</Button>
						</Stack>
					</WorldsUnit>
					<WorldsUnit style={{ maxWidth: 600, minWidth: 400 }}>
						<OverlayingLabel>Contributable worlds</OverlayingLabel>
						<Stack spacing={1} minWidth={256}>
							{contributableWorlds.map((world) => (
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
								</Stack>
							))}
							{ownedWorlds.length === 0 && <WorldListEmptyState />}
						</Stack>
					</WorldsUnit>
					<WorldsUnit style={{ maxWidth: 600, minWidth: 400 }}>
						<OverlayingLabel>Visible worlds</OverlayingLabel>
						<Stack spacing={1} minWidth={256}>
							{visibleWorlds.map((world) => (
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
								</Stack>
							))}
							{ownedWorlds.length === 0 && <WorldListEmptyState />}
						</Stack>
					</WorldsUnit>
				</Stack>
			)}
			<BlockingSpinner visible={isFetching} />
			<WorldWizardModal />
			<ShareWorldModal />
			<DeleteWorldModal />
		</Container>
	)
}
