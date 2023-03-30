import { Delete } from '@mui/icons-material'
import { Button } from '@mui/material'
import { Stack } from '@mui/system'
import { useDispatch } from 'react-redux'

import { useCreateWorldMutation, useGetWorldsQuery } from '../../../api/rheaApi'
import { LoadingSpinner } from '../../components/LoadingSpinner'
import { useWorldRouter } from '../world/router'
import { DeleteWorldModal } from './components/DeleteWorldModal'
import { worldListSlice } from './reducer'

export const WorldList = () => {
	const { data, refetch } = useGetWorldsQuery()
	const [triggerCreateWorld] = useCreateWorldMutation()

	const { navigateToWorldRoot } = useWorldRouter()

	const dispatch = useDispatch()
	const { openDeleteWorldModal } = worldListSlice.actions

	const onCreate = async () => {
		const response = await triggerCreateWorld({
			body: {
				name: 'Unnamed world',
			},
		})
		if ('error' in response) {
			return
		}

		navigateToWorldRoot(response.data.id)
		refetch()
	}

	const onLoad = (id: string) => {
		navigateToWorldRoot(id)
	}

	const onDelete = (world: { id: string; name: string }) => {
		dispatch(openDeleteWorldModal(world))
	}

	return (
		<>
			{!data && <LoadingSpinner />}
			{!!data && (
				<Stack spacing={2}>
					{data.map((world) => (
						<Stack direction="row" justifyContent="space-between" key={world.id}>
							<Button onClick={() => onLoad(world.id)}>
								{world.id}: {world.name}
							</Button>
							<Button onClick={() => onDelete(world)}>
								<Delete />
							</Button>
						</Stack>
					))}
					<Button variant="contained" onClick={onCreate}>
						Create
					</Button>
				</Stack>
			)}
			<DeleteWorldModal />
		</>
	)
}
