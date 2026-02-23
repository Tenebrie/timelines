import Stack from '@mui/material/Stack'
import { createRef, memo, ReactNode } from 'react'
import { createPortal } from 'react-dom'

type WrapperProps = {
	children: ReactNode
	initialLeft: number
	initialTop: number
	left: number
	top: number
	align: {
		top: 'start' | 'center' | 'end'
		left: 'start' | 'center' | 'end'
	}
}

export const GhostWrapper = ({ children, left, top, align }: WrapperProps) => {
	const getTransformAlign = (align: 'start' | 'center' | 'end') => {
		switch (align) {
			case 'start':
				return '0%'
			case 'center':
				return '-50%'
			case 'end':
				return '-100%'
		}
	}

	if (!portalSlotRef.current) {
		return null
	}

	return createPortal(
		<div
			style={{
				pointerEvents: 'none',
				position: 'absolute',
				transform: `translate(${Math.round(left)}px, ${Math.round(top)}px) translate(${getTransformAlign(align.left)}, ${getTransformAlign(align.top)})`,
				transition: 'transform 0.05s ease-out',
				willChange: 'transform',
			}}
		>
			{children}
		</div>,
		portalSlotRef.current,
	)
}

const portalSlotRef = createRef<HTMLDivElement>()

export const DragDropPortalSlot = memo(DragDropPortalSlotComponent)

function DragDropPortalSlotComponent() {
	return (
		<div
			style={{
				position: 'absolute',
				left: 0,
				top: 0,
				pointerEvents: 'none',
				width: '100%',
				height: '100%',
				zIndex: 3,
				overflow: 'hidden',
			}}
		>
			<Stack sx={{ position: 'absolute', alignItems: 'center', justifyContent: 'center', background: 'red' }}>
				<div ref={portalSlotRef}></div>
			</Stack>
		</div>
	)
}
