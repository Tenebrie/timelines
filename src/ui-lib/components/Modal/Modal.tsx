import React, { MouseEvent, useCallback, useEffect, useRef } from 'react'

import { ModalBody, ModalContainer } from './styles'

type Props = {
	visible?: boolean
	children: JSX.Element | JSX.Element[] | null | undefined
	onClose: () => void
}

const Modal = ({ visible, children, onClose }: Props) => {
	const bodyRef = useRef<HTMLDivElement | null>(null)
	const isModalVisible = visible === undefined || visible

	const onContainerClick = () => {
		onClose()
	}

	const onBodyClick = (event: MouseEvent<HTMLDivElement>) => {
		event.stopPropagation()
	}

	const onEscapeKey = useCallback(
		(event: KeyboardEvent) => {
			if (!isModalVisible || event.key !== 'Escape') {
				return
			}

			event.stopPropagation()
			event.preventDefault()
			onClose()
		},
		[isModalVisible, onClose]
	)

	useEffect(() => {
		document.addEventListener('keydown', onEscapeKey)
		return () => document.removeEventListener('keydown', onEscapeKey)
	}, [onEscapeKey])

	return (
		<ModalContainer className={isModalVisible ? 'visible' : ''} onClick={onContainerClick}>
			<ModalBody ref={bodyRef} onClick={onBodyClick}>
				{children}
			</ModalBody>
		</ModalContainer>
	)
}

export default Modal
