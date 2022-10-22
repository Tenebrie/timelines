import { WorldStatement } from '../../../../types'

type Props = {
	card: WorldStatement
	onDelete: () => void
}

export const IssuedStatementCard = ({ card, onDelete }: Props) => {
	return (
		<div>
			<div>ID: {card.id}</div>
			<div>Name: {card.name}</div>
			<div>Text: {card.text}</div>
			<button onClick={onDelete}>X</button>
		</div>
	)
}
