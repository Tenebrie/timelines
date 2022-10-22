import { useSelector } from 'react-redux'

import { getWorldState } from '../../../../selectors'

type Props = {
	id: string
	onDelete: () => void
}

export const RevokedStatementCard = ({ id, onDelete }: Props) => {
	const { events } = useSelector(getWorldState)

	const matchingCard = events.flatMap((event) => event.issuedWorldStatements).find((card) => card.id === id)

	return (
		<div>
			ID: {id}
			Text: {matchingCard?.text || 'Not found'}
			<button onClick={onDelete}>X</button>
		</div>
	)
}
