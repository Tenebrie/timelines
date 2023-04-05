import { Delete, Undo } from '@mui/icons-material'
import LoadingButton from '@mui/lab/LoadingButton'
import { Container, Grid, Stack } from '@mui/material'
import { useRef } from 'react'
import { useSelector } from 'react-redux'

import {
	useRevokeWorldStatementMutation,
	useUnrevokeWorldStatementMutation,
} from '../../../../../api/rheaApi'
import { LoadingSpinner } from '../../../../components/LoadingSpinner'
import { OverlayingLabel } from '../../../../components/OverlayingLabel'
import { parseApiResponse } from '../../../../utils/parseApiResponse'
import { useWorldRouter } from '../../router'
import { getWorldState } from '../../selectors'
import { WorldEvent } from '../../types'
import { EventEditorWrapper } from '../EventEditor/styles'
import { DeleteStatementModal } from './DeleteStatementModal/DeleteStatementModal'
import { EventCard } from './EventCard/EventCard'
import { StatementDetailsEditor } from './StatementDetailsEditor/StatementDetailsEditor'
import { StatementsUnit } from './styles'

export const StatementEditor = () => {
	const { events } = useSelector(getWorldState)

	const { statementEditorParams } = useWorldRouter()
	const { statementId } = statementEditorParams

	const statement = events.flatMap((e) => e.issuedStatements).find((s) => s.id === statementId)
	const issuedByEvent = events.find((e) => e.id === statement?.issuedByEventId)
	const revokedByEvent = events.find((e) => e.id === statement?.revokedByEventId)

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
				// TODO: Figure out why this is here
				body: '',
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
		<Container maxWidth="xl" style={{ height: '100%' }}>
			<Grid container spacing={2} padding={2} columns={{ xs: 12, sm: 12, md: 12 }} height="100%">
				<Grid item xs={0} md={1}></Grid>
				<Grid item xs={12} md={6} style={{ maxHeight: '100%' }}>
					<StatementDetailsEditor key={statement.id} statement={statement} />
				</Grid>
				<Grid item xs={0} md={4}>
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
		</Container>
	)
}
