import { GetWorldCollaboratorsApiResponse, useUnshareWorldMutation } from '@api/worldCollaboratorsApi'
import Cancel from '@mui/icons-material/Cancel'
import Delete from '@mui/icons-material/Delete'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'
import { useCallback, useState } from 'react'
import { useDispatch } from 'react-redux'

import { worldListSlice } from '@/app/features/worldList/reducer'

type Props = {
	worldId: string
	collaborators: GetWorldCollaboratorsApiResponse
}

export const WorldCollaborators = ({ worldId, collaborators }: Props) => {
	const { openShareWorldModal } = worldListSlice.actions
	const dispatch = useDispatch()

	const [removeCollaborator] = useUnshareWorldMutation()

	const [removingUser, setRemovingUser] = useState<string | null>(null)

	const onDelete = useCallback(
		(collaborator: (typeof collaborators)[number]) => {
			if (removingUser === collaborator.user.id) {
				removeCollaborator({
					worldId,
					userId: collaborator.user.id,
				})
				setRemovingUser(null)
			} else {
				setRemovingUser(collaborator.user.id)
			}
		},
		[removeCollaborator, removingUser, worldId],
	)

	const onShareWorld = useCallback(() => {
		dispatch(
			openShareWorldModal({
				id: worldId,
			}),
		)
	}, [dispatch, openShareWorldModal, worldId])

	return (
		<>
			{collaborators.length === 0 && <Typography variant="caption">No collaborators added</Typography>}
			{collaborators.length > 0 && (
				<List dense disablePadding>
					{collaborators.map((collaborator) => (
						<ListItem key={`${collaborator.user.id}-${collaborator.worldId}`} disableGutters disablePadding>
							<ListItemText primary={collaborator.user.email} secondary={collaborator.access} />
							<ListItemSecondaryAction>
								{removingUser === collaborator.user.id && (
									<IconButton
										aria-label={`Cancel removing ${collaborator.user.email} from collaborators.`}
										onClick={() => setRemovingUser(null)}
									>
										<Cancel />
									</IconButton>
								)}
								<IconButton
									aria-label={`Remove ${collaborator.user.email} from collaborators. Requires double click.`}
									onClick={() => onDelete(collaborator)}
									color={removingUser === collaborator.user.id ? 'error' : 'default'}
								>
									<Delete />
								</IconButton>
							</ListItemSecondaryAction>
						</ListItem>
					))}
				</List>
			)}
			<Button onClick={onShareWorld}>Share world with specific people...</Button>
		</>
	)
}
