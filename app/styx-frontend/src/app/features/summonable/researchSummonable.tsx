import Box, { BoxProps } from '@mui/material/Box'
import { ReactNode, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { useAutoRef } from '@/app/hooks/useAutoRef'

import { dispatchGlobalEvent, useEventBusSubscribe } from '../eventBus'
import { SummonableErrorBoundary } from './SummonableErrorBoundary'
import { invokeSummonRepository as invokeSummonRepository, invokeSummonWaitingList } from './SummonAuthority'

type Props = {
	family: string
}

/**
 * Creates a pair of components, defining a Summoner and a Summonable.
 *
 * A Summoner is a component that can be used to summon a Summonable to its current location.
 * A Summonable is a component that can be summoned by a Summoner.
 *
 * @example
 * ```tsx
 * const { Summoner, Summonable } = researchSummonable<MyProps>({
 *   family: 'myComponent'
 * });
 *
 * // Where you want the content to appear:
 * <Summoner props={myProps}>
 *   <Button>Click me</Button>
 * </Summoner>
 *
 * // In your provider component:
 * <Summonable>
 *   {(props) => <MyComponent {...props} />}
 * </Summonable>
 * ```
 *
 * If you don't need to pass props to the summoned content, you can omit the generic parameter:
 * @example
 * ```tsx
 * const { Summoner, Summonable } = researchSummonable({
 *   family: 'myComponent'
 * });
 *
 * // Where you want the content to appear:
 * <Summoner>
 *   <Button>Click me</Button>
 * </Summoner>
 *
 * // In your provider component:
 * <Summonable>
 *   <MyComponent />
 * </Summonable>
 * ```
 *
 * @param options - Configuration options
 * @param options.family - Unique identifier for this summonable family. Used to group related summoners and summonables.
 * @returns Object containing Summoner and Summonable components
 */
export function researchSummonable<SummonableProps = void>({ family }: Props) {
	const repository = invokeSummonRepository()
	const waitingList = invokeSummonWaitingList()
	waitingList[family] = []
	repository[family] = []

	const summon = (target: HTMLElement, initialProps: unknown) => {
		const event = { isHandled: false }
		dispatchGlobalEvent['summonable/requestSummon']({
			family,
			element: target,
			event,
			props: initialProps,
		})

		if (!event.isHandled) {
			waitingList[family].push({ target, props: initialProps })
		}
	}

	const update = (target: HTMLElement, props: unknown) => {
		dispatchGlobalEvent['summonable/requestUpdate']({
			family,
			element: target,
			props,
		})
	}

	const release = (element: HTMLElement) => {
		dispatchGlobalEvent['summonable/requestDismiss']({
			family,
			element,
		})

		waitingList[family] = waitingList[family].filter((e) => e.target !== element)
	}

	/**
	 * Component that can be summoned to render content at a specific DOM location.
	 * Manages the lifecycle of the summoned content and handles updates.
	 *
	 * @returns Rendered content or null if can' be summoned
	 */
	function Summonable({ children }: { children: ReactNode | ((props: SummonableProps) => ReactNode) }) {
		const [props, setProps] = useState<SummonableProps | undefined>(undefined)
		const [targetElement, setTargetElement] = useState<HTMLElement | undefined>(undefined)

		const propsRef = useAutoRef(props)
		const targetElementRef = useAutoRef(targetElement)

		useEventBusSubscribe['summonable/requestSummon']({
			condition: (params) =>
				params.family === family && targetElementRef.current === undefined && !params.event.isHandled,
			callback: (params) => {
				targetElementRef.current = params.element
				setTargetElement(params.element)
				setProps(params.props as SummonableProps)
				propsRef.current = params.props as SummonableProps
				params.event.isHandled = true
			},
		})

		useEventBusSubscribe['summonable/requestUpdate']({
			condition: (params) => params.family === family && params.element === targetElementRef.current,
			callback: (params) => {
				setProps(params.props as SummonableProps)
			},
		})

		useEffect(() => {
			const currentSummoner = waitingList[family].pop()
			if (currentSummoner) {
				setProps(currentSummoner.props as SummonableProps)
				setTargetElement(currentSummoner.target)
				propsRef.current = currentSummoner.props as SummonableProps
				targetElementRef.current = currentSummoner.target
			}

			return () => {
				if (targetElementRef.current) {
					waitingList[family].push({
						target: targetElementRef.current,
						props: propsRef.current as SummonableProps,
					})
				}
			}
		}, [propsRef, targetElementRef])

		useEffect(() => {
			const pushedObject = (() => {
				if (targetElement) {
					return {
						target: targetElement,
						status: 'busy' as const,
					}
				}
				return {
					target: null,
					status: 'parked' as const,
				}
			})()
			repository[family].push(pushedObject)

			return () => {
				repository[family].splice(repository[family].indexOf(pushedObject), 1)
			}
		}, [targetElement])

		useEventBusSubscribe['summonable/requestDismiss']({
			condition: (params) => params.family === family && params.element === targetElementRef.current,
			callback: () => {
				const newTarget = waitingList[family].pop()
				if (newTarget) {
					setProps(newTarget.props as SummonableProps)
					propsRef.current = newTarget.props as SummonableProps
					setTargetElement(newTarget.target)
					targetElementRef.current = newTarget.target
				} else {
					setProps(undefined)
					propsRef.current = undefined
					setTargetElement(undefined)
					targetElementRef.current = undefined
				}
			},
		})

		if (!targetElement) {
			return null
		}

		return createPortal(
			<SummonableErrorBoundary family={family}>
				{typeof children === 'function' ? children(props as SummonableProps) : children}
			</SummonableErrorBoundary>,
			targetElement,
		)
	}

	/**
	 * Component that triggers the summoning of content.
	 * When mounted, it registers itself as a summoner and manages updates to the summoned content.
	 *
	 * Passed props are provided to the wrapper (Box) component.
	 * `.props` is provided to the summoned content.
	 *
	 * @param data - Component props
	 * @param data.props - Props to pass to the summoned content
	 * @returns Rendered component
	 */
	function Summoner(data: SummonableProps extends void ? BoxProps : { props: SummonableProps } & BoxProps) {
		const ref = useRef<HTMLDivElement | null>(null)

		const props = useMemo(() => ('props' in data ? data.props : undefined), [data])
		const initialProps = useRef(props)
		useLayoutEffect(() => {
			const currentElement = ref.current
			if (currentElement) {
				summon(currentElement, initialProps.current)
				return () => {
					release(currentElement)
				}
			}
		}, [])

		useEffect(() => {
			if (ref.current) {
				update(ref.current, props)
			}
		}, [props])

		// Remove the inner props
		const boxProps = {
			...data,
			props: undefined,
		}

		return <Box ref={ref} {...boxProps} />
	}

	return {
		Summoner,
		Summonable,
	}
}
