import { Delete, Undo } from '@mui/icons-material'
import LoadingButton from '@mui/lab/LoadingButton'
import { Grid, Stack } from '@mui/material'
import { useRef } from 'react'

import {
	useRevokeWorldStatementMutation,
	useUnrevokeWorldStatementMutation,
} from '../../../../../api/rheaApi'
import { useStatementEditorData } from '../../../../../hooks/useStatementEditorData'
import { LoadingSpinner } from '../../../../components/LoadingSpinner'
import { OverlayingLabel } from '../../../../components/OverlayingLabel'
import { parseApiResponse } from '../../../../utils/parseApiResponse'
import { useWorldRouter } from '../../router'
import { WorldEvent } from '../../types'
import { EventEditorWrapper, FullHeightContainer } from '../EventEditor/styles'
import { DeleteStatementModal } from './DeleteStatementModal/DeleteStatementModal'
import { EventCard } from './EventCard/EventCard'
import { StatementDetailsEditor } from './StatementDetailsEditor/StatementDetailsEditor'
import { StatementsUnit } from './styles'

export const StatementEditor = () => {
	const { statementEditorParams } = useWorldRouter()
	const { statement, issuedByEvent, revokedByEvent } = useStatementEditorData()

	const previouslyRevokedBy = useRef<WorldEvent | null>(null)

	const [revokeWorldStatement, { isLoading: isRevoking }] = useRevokeWorldStatementMutation()
	const [unrevokeWorldStatement, { isLoading: isUnrevoking }] = useUnrevokeWorldStatementMutation()

	if (!statement) {
		return (
			<EventEditorWrapper>
				<LoadingSpinner />
			</EventEditorWrapper>
		)
	}

	const onUnrevoke = async () => {
		if (!revokedByEvent) {
			return
		}

		const { error } = parseApiResponse(
			await unrevokeWorldStatement({
				worldId: statementEditorParams.worldId,
				statementId: statement.id,
			})
		)
		if (error) {
			return
		}
		previouslyRevokedBy.current = revokedByEvent
	}

	const onUndoUnrevoke = async () => {
		if (!previouslyRevokedBy.current) {
			return
		}

		const { error } = parseApiResponse(
			await revokeWorldStatement({
				worldId: statementEditorParams.worldId,
				statementId: statement.id,
				body: { eventId: previouslyRevokedBy.current.id },
			})
		)
		if (error) {
			return
		}
		previouslyRevokedBy.current = null
	}

	return (
		<FullHeightContainer maxWidth="xl">
			<Grid container spacing={2} padding={2} columns={{ xs: 12, sm: 12, md: 12 }} height="100%">
				<Grid item xs={0} md={1}></Grid>
				<Grid item xs={12} md={6} style={{ maxHeight: '100%' }}>
					<StatementDetailsEditor key={statement.id} statement={statement} />
				</Grid>
				<Grid item xs={12} md={4}>
					<Stack spacing={1}>
						{issuedByEvent && (
							<StatementsUnit>
								<OverlayingLabel>Issued by</OverlayingLabel>
								<EventCard card={issuedByEvent} />
							</StatementsUnit>
						)}
						{revokedByEvent && (
							<StatementsUnit>
								<OverlayingLabel>Revoked by</OverlayingLabel>
								<EventCard card={revokedByEvent} />
								<LoadingButton
									loading={isUnrevoking}
									variant="outlined"
									color="error"
									onClick={onUnrevoke}
									loadingPosition="start"
									startIcon={<Delete />}
								>
									<span>Remove link</span>
								</LoadingButton>
							</StatementsUnit>
						)}
						{previouslyRevokedBy.current && (
							<LoadingButton
								loading={isRevoking}
								variant="outlined"
								color="secondary"
								onClick={onUndoUnrevoke}
								loadingPosition="start"
								startIcon={<Undo />}
							>
								<span>Restore link</span>
							</LoadingButton>
						)}
					</Stack>
				</Grid>
			</Grid>
			<DeleteStatementModal />
		</FullHeightContainer>
	)
}
