import React, { MouseEvent } from 'react'

import { ModalBody, ModalContainer } from './styles'

type Props = {
	visible?: boolean
	children: JSX.Element | JSX.Element[] | null | undefined
	onClose: () => void
}

const Modal = ({ visible, children, onClose }: Props) => {
	const isModalVisible = visible === undefined || visible

	const onContainerClick = () => {
		onClose()
	}

	const onBodyClick = (event: MouseEvent<HTMLDivElement>) => {
		event.stopPropagation()
	}

	return (
		<ModalContainer className={isModalVisible ? 'visible' : ''} onClick={onContainerClick}>
			<ModalBody onClick={onBodyClick}>{children}</ModalBody>
		</ModalContainer>
	)
}

export default Modal
