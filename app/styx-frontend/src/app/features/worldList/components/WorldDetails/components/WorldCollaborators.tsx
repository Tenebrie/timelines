import { Button, Typography } from '@mui/material'
import { useCallback } from 'react'
import { useDispatch } from 'react-redux'

import { GetWorldCollaboratorsApiResponse } from '../../../../../../api/rheaApi'
import { worldListSlice } from '../../../reducer'

type Props = {
	worldId: string
	collaborators: GetWorldCollaboratorsApiResponse
}

export const WorldCollaborators = ({ worldId, collaborators }: Props) => {
	const { openShareWorldModal } = worldListSlice.actions
	const dispatch = useDispatch()

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
			{collaborators.length > 0 && collaborators.map((collaborator) => <>{collaborator.user.email}</>)}
			<Button onClick={onShareWorld}>Share world</Button>
		</>
	)
}
