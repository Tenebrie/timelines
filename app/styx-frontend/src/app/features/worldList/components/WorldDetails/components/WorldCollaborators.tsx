import { Cancel, Delete } from '@mui/icons-material'
import {
	Button,
	IconButton,
	List,
	ListItem,
	ListItemSecondaryAction,
	ListItemText,
	Typography,
} from '@mui/material'
import { useCallback, useState } from 'react'
import { useDispatch } from 'react-redux'

import { GetWorldCollaboratorsApiResponse, useUnshareWorldMutation } from '../../../../../../api/rheaApi'
import { worldListSlice } from '../../../reducer'

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
			if (removingUser === collaborator.userId) {
				removeCollaborator({
					worldId,
					userEmail: collaborator.user.email,
				})
				setRemovingUser(null)
			} else {
				setRemovingUser(collaborator.userId)
			}
		},
		[removeCollaborator, removingUser, worldId]
	)

	const onShareWorld = useCallback(() => {
		dispatch(
			openShareWorldModal({
				id: worldId,
			})
		)
	}, [dispatch, openShareWorldModal, worldId])

	return (
		<>
			{collaborators.length === 0 && <Typography variant="caption">Empty!</Typography>}
			{collaborators.length > 0 && (
				<List>
					{collaborators.map((collaborator) => (
						<ListItem key={`${collaborator.userId}-${collaborator.worldId}`}>
							<ListItemText primary={collaborator.user.email} secondary={collaborator.access} />
							<ListItemSecondaryAction>
								{removingUser === collaborator.userId && (
									<IconButton>
										<Cancel />
									</IconButton>
								)}
								<IconButton
									onClick={() => onDelete(collaborator)}
									color={removingUser === collaborator.userId ? 'error' : 'default'}
								>
									<Delete />
								</IconButton>
							</ListItemSecondaryAction>
						</ListItem>
					))}
				</List>
			)}
			<Button onClick={onShareWorld}>Share world</Button>
		</>
	)
}
