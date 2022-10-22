import { Add } from '@mui/icons-material'
import { Button, TextField } from '@mui/material'
import { useEffect, useState } from 'react'

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
		onCreate(
			makeWorldStoryCard({
				name,
				text,
			})
		)
	}

	return (
		<Modal visible={open} onClose={onClose}>
			<ModalHeader>New Issued Statement</ModalHeader>
			<TextField label="Name" type="text" value={name} onChange={(event) => setName(event.target.value)} />
			<TextField
				value={text}
				onChange={(e) => setText(e.target.value)}
				type={'text'}
				label="Statement text"
				multiline
				minRows={3}
			/>
			<Button variant="outlined" onClick={onConfirmClick}>
				<Add /> Create
			</Button>
		</Modal>
	)
}
