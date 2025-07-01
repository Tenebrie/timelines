import Stack from '@mui/material/Stack'
import { createRef, memo, ReactNode, useState } from 'react'
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
	const parseAlign = (size: number, align: 'start' | 'center' | 'end') => {
		switch (align) {
			case 'start':
				return '0'
			case 'center':
				return `-${size / 2}px`
			case 'end':
				return `-${size}px`
		}
	}

	const [width, setWidth] = useState(0)
	const [height, setHeight] = useState(0)

	if (!portalSlotRef.current) {
		return null
	}

	return createPortal(
		<div
			style={{
				pointerEvents: 'none',
				position: 'absolute',
				transform: `translate(${left}px, ${top}px)`,
				top: parseAlign(height, align.top),
				left: parseAlign(width, align.left),
			}}
			ref={(ref) => {
				if (!ref) {
					return
				}
				const rect = ref.getBoundingClientRect()
				setWidth(rect.width)
				setHeight(rect.height)
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
				zIndex: 1000,
				overflow: 'hidden',
			}}
		>
			<Stack sx={{ position: 'absolute', alignItems: 'center', justifyContent: 'center', background: 'red' }}>
				<div ref={portalSlotRef}></div>
			</Stack>
		</div>
	)
}
