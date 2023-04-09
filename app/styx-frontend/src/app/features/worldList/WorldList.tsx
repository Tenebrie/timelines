import { Delete } from '@mui/icons-material'
import { Button, Stack, Typography } from '@mui/material'
import { useDispatch } from 'react-redux'

import { useGetWorldsQuery } from '../../../api/rheaApi'
import { BlockingSpinner } from '../../components/BlockingSpinner'
import { useWorldRouter } from '../world/router'
import { DeleteWorldModal } from './components/DeleteWorldModal'
import { worldListSlice } from './reducer'
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
		<>
			{!!data && (
				<Stack spacing={1} minWidth={256}>
					{data.length > 0 && <Typography variant="h6">Your Worlds:</Typography>}
					{data.map((world) => (
						<Stack direction="row" justifyContent="space-between" key={world.id}>
							<Button
								fullWidth={true}
								onClick={() => onLoad(world.id)}
								style={{ justifyContent: 'start' }}
								data-hj-suppress
							>
								- {world.name}
							</Button>
							<Button onClick={() => onDelete(world)}>
								<Delete />
							</Button>
						</Stack>
					))}
					<Button onClick={onCreate}>Create new world...</Button>
				</Stack>
			)}
			<BlockingSpinner visible={isFetching} />
			<WorldWizardModal />
			<DeleteWorldModal />
		</>
	)
}
