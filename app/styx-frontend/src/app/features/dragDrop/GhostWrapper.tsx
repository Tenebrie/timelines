import { ReactNode } from 'react'

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

export const GhostWrapper = ({ children, initialLeft, initialTop, left, top, align }: WrapperProps) => {
	const parseAlign = (align: 'start' | 'center' | 'end') => {
		switch (align) {
			case 'start':
				return '0'
			case 'center':
				return 'calc(-50%)'
			case 'end':
				return 'calc(-100%)'
		}
	}

	return (
		<div
			style={{
				pointerEvents: 'none',
				position: 'absolute',
				transform: `translate(${left - initialLeft}px, ${top - initialTop}px)`,
				top: parseAlign(align.top),
				left: parseAlign(align.left),
			}}
		>
			{children}
		</div>
	)
}
