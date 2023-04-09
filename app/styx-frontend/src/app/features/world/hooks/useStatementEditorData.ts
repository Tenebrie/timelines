import { useSelector } from 'react-redux'

import { useWorldRouter } from '../router'
import { getWorldState } from '../selectors'

export const useStatementEditorData = () => {
	const { events } = useSelector(getWorldState)

	const { statementEditorParams } = useWorldRouter()
	const { statementId } = statementEditorParams

	const statement = events.flatMap((e) => e.issuedStatements).find((s) => s.id === statementId)
	const issuedByEvent = events.find((e) => e.id === statement?.issuedByEventId)
	const revokedByEvent = events.find((e) => e.id === statement?.revokedByEventId)

	return {
		statement,
		issuedByEvent,
		revokedByEvent,
	}
}
