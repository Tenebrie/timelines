import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSelector } from 'react-redux'

import { getTimelinePreferences } from '@/app/features/preferences/PreferencesSliceSelectors'
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
	const { reduceAnimations } = useSelector(
		getTimelinePreferences,
		(a, b) => a.reduceAnimations === b.reduceAnimations,
	)
	const bodyRef = useRef<HTMLDivElement | null>(null)

	const [isModalVisible, setIsModalVisible] = useState(false)
	const [isModalRendered, setIsModalRendered] = useState(false)
	const [modalRenderTimeout, setModalRenderTimeout] = useState<number | null>(null)

	useShortcut(Shortcut.Escape, () => onClose('escapeKey'), isModalVisible && ShortcutPriorities.Modal)

	const animationDuration = useMemo(() => {
		if (reduceAnimations) {
			return 0
		}
		return 300
	}, [reduceAnimations])

	useEffect(() => {
		setTimeout(() => {
			setIsModalVisible(visible)
		}, 1)
	}, [visible])

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
			}, animationDuration)
			setModalRenderTimeout(timeout)
		}
	}, [isModalRendered, isModalVisible, animationDuration])

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

	if (!visible && !isModalRendered) {
		return null
	}

	return (
		<ModalBackdrop
			data-testid="ModalBackdrop"
			className={isModalVisible ? 'visible' : ''}
			onMouseDown={onMouseDown}
			onMouseUp={onMouseUp}
			onMouseLeave={() => (isClickingRef.current = false)}
			style={{ transition: animationDuration > 0 ? `opacity ${animationDuration}ms` : 'none' }}
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
				{children}
			</ModalContainer>
		</ModalBackdrop>
	)
}

export default Modal
