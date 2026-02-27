import React, { useCallback, useEffect, useRef, useState } from 'react'

import { useCustomTheme } from '@/app/features/theming/hooks/useCustomTheme'
import { Shortcut, ShortcutPriorities, useShortcut } from '@/app/hooks/useShortcut/useShortcut'

import { ModalBackdrop, ModalContainer } from './styles'

type Props = {
	visible: boolean
	children: React.ReactNode
	onClose: (reason: 'backdropClick' | 'escapeKey') => void
	closeOnBackdropClick?: boolean
}

const Modal = ({ visible, children, onClose, closeOnBackdropClick = true }: Props) => {
	const bodyRef = useRef<HTMLDivElement | null>(null)

	const isModalVisible = visible
	const [isModalRendered, setIsModalRendered] = useState(false)
	const [modalRenderTimeout, setModalRenderTimeout] = useState<number | null>(null)

	useShortcut(Shortcut.Escape, () => onClose('escapeKey'), isModalVisible && ShortcutPriorities.MODAL)

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
	const isClickingRef = useRef(false)

	const onMouseDown = useCallback(
		(e: React.MouseEvent<HTMLDivElement>) => {
			if (!closeOnBackdropClick || e.button !== 0) {
				return
			}
			isClickingRef.current = true
		},
		[closeOnBackdropClick],
	)

	const onMouseUp = useCallback(
		(e: React.MouseEvent<HTMLDivElement>) => {
			if (!closeOnBackdropClick || e.button !== 0 || !isClickingRef.current) {
				return
			}
			if (isClickingRef.current) {
				onClose('backdropClick')
			}
			isClickingRef.current = false
		},
		[closeOnBackdropClick, onClose],
	)

	return (
		<ModalBackdrop
			data-testid="modal-backdrop"
			className={isModalVisible ? 'visible' : ''}
			onMouseDown={onMouseDown}
			onMouseUp={onMouseUp}
			onMouseLeave={() => (isClickingRef.current = false)}
		>
			<ModalContainer
				ref={bodyRef}
				$theme={theme}
				onMouseDown={(e) => {
					e.stopPropagation()
				}}
				onMouseUp={(e) => e.stopPropagation()}
				onClick={(e) => e.stopPropagation()}
			>
				{isModalRendered && children}
			</ModalContainer>
		</ModalBackdrop>
	)
}

export default Modal
