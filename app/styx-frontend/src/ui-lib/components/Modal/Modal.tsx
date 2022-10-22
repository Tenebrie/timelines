import React, { MouseEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { ModalContainer, ModalWrapper } from './styles'

type Props = {
	visible?: boolean
	children: JSX.Element | JSX.Element[] | null | undefined
	onClose: () => void
}

const Modal = ({ visible, children, onClose }: Props) => {
	const bodyRef = useRef<HTMLDivElement | null>(null)

	const isModalVisible = useMemo(() => visible === undefined || visible, [visible])
	const [isModalRendered, setIsModalRendered] = useState(false)
	const [modalRenderTimeout, setModalRenderTimeout] = useState<number | null>(null)

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

	return (
		<ModalWrapper className={isModalVisible ? 'visible' : ''} onClick={onContainerClick}>
			<ModalContainer ref={bodyRef} onClick={onBodyClick}>
				{isModalRendered && children}
			</ModalContainer>
		</ModalWrapper>
	)
}

export default Modal
