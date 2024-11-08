import { ReactNode } from 'react'

type WrapperProps = {
	children: ReactNode
	initialLeft: number
	initialTop: number
	left: number
	top: number
}

export const GhostWrapper = ({ children, initialLeft, initialTop, left, top }: WrapperProps) => {
	return (
		<div
			style={{
				pointerEvents: 'none',
				position: 'absolute',
				transform: `translate(${left - initialLeft}px, ${top - initialTop}px)`,
				top: 'calc(-50% + 5px)',
				left: 'calc(-50% + 5px)',
			}}
		>
			{children}
		</div>
	)
}
