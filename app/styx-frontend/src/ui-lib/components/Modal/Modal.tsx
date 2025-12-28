import React, { useEffect, useRef, useState } from 'react'

import { useCustomTheme } from '@/app/features/theming/hooks/useCustomTheme'
import { Shortcut, useShortcut } from '@/app/hooks/useShortcut/useShortcut'

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

	useShortcut(Shortcut.Escape, onClose, isModalVisible ? 10 : -1)

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

	const theme = useCustomTheme()

	return (
		<ModalWrapper className={isModalVisible ? 'visible' : ''}>
			<ModalContainer ref={bodyRef} $theme={theme}>
				{isModalRendered && children}
			</ModalContainer>
		</ModalWrapper>
	)
}

export default Modal
