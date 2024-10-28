import { useTheme } from '@mui/material'
import React, { useCallback, useEffect, useRef, useState } from 'react'

import { ModalContainer, ModalWrapper } from './styles'

type Props = {
	visible: boolean
	children: React.ReactNode
	onClose: () => void
}

const Modal = ({ visible, children, onClose }: Props) => {
	const bodyRef = useRef<HTMLDivElement | null>(null)

	const isModalVisible = visible
	const [isModalRendered, setIsModalRendered] = useState(false)
	const [modalRenderTimeout, setModalRenderTimeout] = useState<number | null>(null)

	const onEscapeKey = useCallback(
		(event: KeyboardEvent) => {
			if (!isModalVisible || event.key !== 'Escape') {
				return
			}

			event.stopPropagation()
			event.preventDefault()
			onClose()
		},
		[isModalVisible, onClose],
	)

	useEffect(() => {
		document.addEventListener('keydown', onEscapeKey)
		return () => document.removeEventListener('keydown', onEscapeKey)
	}, [onEscapeKey])

	useEffect(() => {
		if (isModalVisible && !isModalRendered) {
			setIsModalRendered(true)
			if (modalRenderTimeout) {
				window.clearTimeout(modalRenderTimeout)
			}
		}
	}, [isModalRendered, isModalVisible, modalRenderTimeout])

	useEffect(() => {
		if (!isModalVisible && isModalRendered) {
			const timeout = window.setTimeout(() => {
				setIsModalRendered(false)
			}, 300)
			setModalRenderTimeout(timeout)
		}
	}, [isModalRendered, isModalVisible])

	const theme = useTheme()

	return (
		<ModalWrapper className={isModalVisible ? 'visible' : ''}>
			<ModalContainer ref={bodyRef} theme={theme}>
				{isModalRendered && children}
			</ModalContainer>
		</ModalWrapper>
	)
}

export default Modal
