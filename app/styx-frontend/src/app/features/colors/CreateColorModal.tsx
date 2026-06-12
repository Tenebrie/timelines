import DoneAllIcon from '@mui/icons-material/DoneAll'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { useState } from 'react'

import { ColorPicker } from '@/app/components/ColorPicker/ColorPicker'
import { useModal } from '@/app/features/modals/ModalsSlice'
import { Shortcut, useShortcut } from '@/app/hooks/useShortcut/useShortcut'
import Modal, { ModalFooter, ModalHeader, useModalCleanup } from '@/ui-lib/components/Modal'

export const CreateColorModal = () => {
	const [color, setColor] = useState('')

	const { isOpen, close } = useModal('createColorModal')

	useModalCleanup({
		isOpen,
		onCleanup: () => {
			setColor('#33bbbb')
		},
	})

	useShortcut([Shortcut.Enter, Shortcut.CtrlEnter], close, isOpen)

	return (
		<Modal visible={isOpen} onClose={close}>
			<ModalHeader>Manage saved colors</ModalHeader>
			<Stack spacing={2}>
				<ColorPicker initialValue={color} onChangeHex={setColor} />
			</Stack>
			<ModalFooter>
				<Button variant="contained" onClick={close} startIcon={<DoneAllIcon />}>
					Done
				</Button>
			</ModalFooter>
		</Modal>
	)
}
