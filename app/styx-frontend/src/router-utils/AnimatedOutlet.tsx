import { getRouterContext, RouterContextProvider, useMatch, useMatches } from '@tanstack/react-router'
import cloneDeep from 'clone-deep'
import { ReactNode, useContext, useRef } from 'react'
import { CSSTransition, SwitchTransition } from 'react-transition-group'
import { CSSTransitionProps } from 'react-transition-group/CSSTransition'

type Props2 = {
	transitionKey: string
	children: ReactNode
} & CSSTransitionProps

export const FadeTransition = ({ transitionKey, children, ...props }: Props2) => {
	const nodeRef = useRef(null)

	return (
		<SwitchTransition>
			<CSSTransition {...props} key={transitionKey} timeout={1500} nodeRef={nodeRef} classNames="fade">
				<div ref={nodeRef}>{children}</div>
			</CSSTransition>
		</SwitchTransition>
	)
}
type Props = {
	children: ReactNode
}

export const AnimatedOutlet = ({ children }: Props) => {
	const matches = useMatches()
	const match = useMatch({ strict: false })
	const matchIndex = matches.findIndex((d) => d.id === match.id)
	const nextMatchIndex = matchIndex === matches.length - 1 ? matchIndex : matchIndex + 1
	const nextMatch = matches[nextMatchIndex]

	const RouterContext = getRouterContext()
	const routerContext = useContext(RouterContext)
	const renderedContext = useRef(routerContext)
	const isPresent = useRef(true)

	// if (isPresent.current) {
	// 	const clone = cloneDeep(routerContext)
	// 	renderedContext.current = clone
	// }
	// console.log(nextMatch.pathname)

	return (
		<FadeTransition
			mountOnEnter={true}
			unmountOnExit={true}
			appear={true}
			transitionKey={nextMatch.pathname}
			onEnter={() => {
				isPresent.current = true
				console.log(routerContext)
			}}
			onExit={() => {
				isPresent.current = false
				renderedContext.current = cloneDeep(routerContext)
				console.log(routerContext)
			}}
		>
			<RouterContextProvider router={renderedContext.current}>{children}</RouterContextProvider>
		</FadeTransition>
	)
}
