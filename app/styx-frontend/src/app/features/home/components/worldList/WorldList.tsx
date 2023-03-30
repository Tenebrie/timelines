import { Button } from '@mui/material'
import { Stack } from '@mui/system'

import { useCreateWorldMutation, useGetWorldsQuery } from '../../../../../api/rheaApi'
import { LoadingSpinner } from '../../../../components/LoadingSpinner'
import { useWorldRouter } from '../../../world/router'

export const WorldList = () => {
	const { data, refetch } = useGetWorldsQuery()
	const [triggerCreateWorld] = useCreateWorldMutation()
	const { navigateToWorldRoot } = useWorldRouter()

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

	return (
		<>
			{!data && <LoadingSpinner />}
			{!!data && (
				<Stack spacing={2}>
					{data.map((world) => (
						<Button onClick={() => onLoad(world.id)} key={world.id}>
							{world.id}: {world.name}
						</Button>
					))}
					<Button variant="contained" onClick={onCreate}>
						Create
					</Button>
				</Stack>
			)}
		</>
	)
}
