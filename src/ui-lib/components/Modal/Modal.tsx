import React, { MouseEvent, ReactElement } from 'react'

import { ModalBody, ModalContainer } from './styles'

type Props = {
	visible: boolean
	children: ReactElement | ReactElement[]
	onClose: () => void
}

const Modal = ({ visible, children, onClose }: Props) => {
	if (!visible) {
		return <div />
	}

	const onContainerClick = () => {
		onClose()
	}

	const onBodyClick = (event: MouseEvent<HTMLDivElement>) => {
		event.stopPropagation()
	}

	return (
		<ModalContainer onClick={onContainerClick}>
			<ModalBody onClick={onBodyClick}>{children}</ModalBody>
		</ModalContainer>
	)
}

export default Modal
