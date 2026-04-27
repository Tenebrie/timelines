import Stack from '@mui/material/Stack'
import { createRef, memo, ReactNode, Ref } from 'react'
import { createPortal } from 'react-dom'

type WrapperProps = {
	children: ReactNode
	ref?: Ref<HTMLDivElement>
	initialLeft: number
	initialTop: number
	left: number
	top: number
	align: {
		top: 'start' | 'center' | 'end'
		left: 'start' | 'center' | 'end'
	}
}

export function GhostWrapper({ children, ref, left, top, align }: WrapperProps) {
	if (!portalSlotRef.current) {
		return null
	}

	return createPortal(
		<div
			ref={ref}
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

export function getTransformAlign(align: 'start' | 'center' | 'end') {
	switch (align) {
		case 'start':
			return '0%'
		case 'center':
			return '-50%'
		case 'end':
			return '-100%'
	}
}
