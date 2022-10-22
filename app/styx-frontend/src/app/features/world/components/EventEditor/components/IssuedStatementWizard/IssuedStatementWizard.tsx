import { Add } from '@mui/icons-material'
import { Button, TextField, Tooltip } from '@mui/material'
import { useEffect, useState } from 'react'

import { Shortcut, useShortcut } from '../../../../../../../hooks/useShortcut'
import Modal from '../../../../../../../ui-lib/components/Modal/Modal'
import { ModalHeader } from '../../../../../../../ui-lib/components/Modal/styles'
import { makeWorldStoryCard } from '../../../../creators'
import { WorldStatement } from '../../../../types'

type Props = {
	open: boolean
	onCreate: (card: WorldStatement) => void
	onClose: () => void
}

export const IssuedStatementWizard = ({ open, onCreate, onClose }: Props) => {
	const [name, setName] = useState('')
	const [text, setText] = useState('')

	useEffect(() => {
		if (!open) {
			return
		}

		setName('')
		setText('')
	}, [open])

	const onConfirmClick = () => {
		if (!open) {
			return
		}
		onCreate(
			makeWorldStoryCard({
				name,
				text,
			})
		)
		onClose()
	}

	const { largeLabel: shortcutLabel } = useShortcut(Shortcut.CtrlEnter, () => {
		onConfirmClick()
	})

	return (
		<Modal visible={open} onClose={onClose}>
			<ModalHeader>New Issued Statement</ModalHeader>
			<TextField
				label="Name"
				type="text"
				value={name}
				onChange={(event) => setName(event.target.value)}
				autoFocus
			/>
			<TextField
				value={text}
				onChange={(e) => setText(e.target.value)}
				type={'text'}
				label="Statement text"
				multiline
				minRows={3}
			/>
			<Tooltip title={shortcutLabel} arrow placement="top">
				<Button variant="outlined" onClick={onConfirmClick}>
					<Add /> Create
				</Button>
			</Tooltip>
		</Modal>
	)
}
