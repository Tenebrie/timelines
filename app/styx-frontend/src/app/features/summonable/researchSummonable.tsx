import Box, { BoxProps } from '@mui/material/Box'
import { ReactNode, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { useAutoRef } from '@/app/hooks/useAutoRef'

import { dispatchEvent, useEventBusSubscribe } from '../eventBus'
import { invokeSummoningRepository, invokeSummonWaitingList } from './SummonAuthority'

type Props = {
	family: string
}

export function researchSummonable<SummonableProps = void>({ family }: Props) {
	const repository = invokeSummoningRepository()
	const waitingList = invokeSummonWaitingList()
	repository[family] = []
	waitingList[family] = []

	const summon = (target: HTMLElement, props: unknown) => {
		const event = { isHandled: false }
		dispatchEvent({
			event: 'summonable/requestSummon',
			params: {
				family,
				element: target,
				event,
				props,
			},
		})

		if (!event.isHandled) {
			waitingList[family].push({ target, props })
		}
	}

	const release = (element: HTMLElement) => {
		dispatchEvent({
			event: 'summonable/requestDismiss',
			params: {
				family,
				element,
			},
		})

		waitingList[family] = waitingList[family].filter((e) => e.target !== element)
	}

	function Summonable({ children }: { children: ReactNode | ((props: SummonableProps) => ReactNode) }) {
		const [props, setProps] = useState<SummonableProps | undefined>(undefined)
		const [targetElement, setTargetElement] = useState<HTMLElement | undefined>(undefined)

		const propsRef = useAutoRef(props)
		const targetElementRef = useAutoRef(targetElement)

		useEventBusSubscribe({
			event: 'summonable/requestSummon',
			condition: (params) => params.family === family && targetElementRef.current === undefined,
			callback: (params) => {
				targetElementRef.current = params.element
				setTargetElement(params.element)
				setProps(params.props as SummonableProps)
				propsRef.current = params.props as SummonableProps
				params.event.isHandled = true
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

		useEventBusSubscribe({
			event: 'summonable/requestDismiss',
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
			typeof children === 'function' ? children(props as SummonableProps) : children,
			targetElement,
		)
	}

	function SummoningPortal(
		data: SummonableProps extends void ? BoxProps : { props: SummonableProps } & BoxProps,
	) {
		const ref = useRef<HTMLDivElement | null>(null)

		useEffect(() => {
			const currentElement = ref.current
			if (currentElement) {
				const props = 'props' in data ? data.props : undefined
				summon(currentElement, props)
				return () => {
					release(currentElement)
				}
			}
		}, [data])

		// Remove the inner props
		const boxProps = {
			...data,
			props: undefined,
		}

		return <Box ref={ref} {...boxProps} />
	}

	return {
		Summonable,
		SummoningPortal,
	}
}
