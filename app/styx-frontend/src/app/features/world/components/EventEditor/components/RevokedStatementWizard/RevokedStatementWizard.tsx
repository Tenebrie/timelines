import { Add } from '@mui/icons-material'
import { Button, FormControl, InputLabel, MenuItem, Select, Tooltip } from '@mui/material'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

import { Shortcut, useShortcut } from '../../../../../../../hooks/useShortcut'
import Modal from '../../../../../../../ui-lib/components/Modal/Modal'
import { getWorldState } from '../../../../selectors'
import { WorldEvent, WorldStatement } from '../../../../types'

type Props = {
	editorEvent: WorldEvent
	open: boolean
	onRevoke: (card: WorldStatement) => void
	onClose: () => void
}

export const RevokedStatementWizard = ({ editorEvent, open, onRevoke, onClose }: Props) => {
	const [id, setId] = useState('')

	const { events: worldEvents } = useSelector(getWorldState)

	const removableCards = worldEvents
		.filter((event) => event.timestamp < editorEvent.timestamp)
		.flatMap((event) =>
			event.issuedStatements.map((statement) => ({
				...statement,
				event,
			}))
		)

	useEffect(() => {
		if (!open) {
			return
		}

		setId('')
	}, [open])

	const onConfirmClick = () => {
		if (!open) {
			return
		}

		onRevoke(removableCards.find((card) => card.id === id)!)
		onClose()
	}

	const { largeLabel: shortcutLabel } = useShortcut(Shortcut.CtrlEnter, () => {
		onConfirmClick()
	})

	return (
		<Modal visible={open} onClose={onClose}>
			<FormControl fullWidth>
				<InputLabel id="demo-simple-select-label">Statement to revoke</InputLabel>
				<Select
					value={id}
					label="Statement to revoke"
					labelId="demo-simple-select-label"
					onChange={(event) => setId(event.target.value)}
				>
					{removableCards.map((card) => (
						<MenuItem key={card.id} value={card.id}>
							{card.event.name} / {card.title}
						</MenuItem>
					))}
				</Select>
			</FormControl>
			<Tooltip title={shortcutLabel} arrow placement="top">
				<Button variant="outlined" onClick={onConfirmClick}>
					<Add /> Create
				</Button>
			</Tooltip>
		</Modal>
	)
}
