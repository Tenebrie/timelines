import React from 'react'
import { useLocation } from 'react-router-dom'
import { CSSTransition, SwitchTransition } from 'react-transition-group'

type Props = {
	children: React.ReactNode
}

export const RouteTransition = ({ children }: Props) => {
	const { key } = useLocation()

	return (
		<SwitchTransition>
			<CSSTransition key={key} classNames="fade" timeout={300} unmountOnExit>
				{children}
			</CSSTransition>
		</SwitchTransition>
	)
}
