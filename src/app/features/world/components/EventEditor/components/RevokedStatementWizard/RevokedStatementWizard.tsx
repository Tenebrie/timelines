import { Add } from '@mui/icons-material'
import { Button } from '@mui/material'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

import Modal from '../../../../../../../ui-lib/components/Modal/Modal'
import { getWorldState } from '../../../../selectors'
import { StoryEvent } from '../../../../types'

type Props = {
	editorEvent: StoryEvent
	open: boolean
	onCreate: (id: string) => void
	onClose: () => void
}

export const RevokedStatementWizard = ({ editorEvent, open, onCreate, onClose }: Props) => {
	const [id, setId] = useState('')

	const { events: worldEvents } = useSelector(getWorldState)

	const removableCards = worldEvents
		.filter((event) => event.timestamp < editorEvent.timestamp)
		.flatMap((event) => event.issuedWorldStatements)

	useEffect(() => {
		if (!open) {
			return
		}

		setId('')
	}, [open])

	const onConfirmClick = () => {
		onCreate(id)
	}

	return (
		<Modal visible={open} onClose={onClose}>
			<span>Card to remove:</span>
			<select>
				{removableCards.map((card) => (
					<option key={card.id}>{card.name}</option>
				))}
			</select>
			<Button variant="outlined" onClick={onConfirmClick}>
				<Add /> Create
			</Button>
		</Modal>
	)
}
