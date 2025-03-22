import Box from '@mui/material/Box'
import { ReactNode, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { useAutoRef } from '@/app/hooks/useAutoRef'

import { dispatchEvent, useEventBusSubscribe } from '../eventBus'
import { invokeSummoningRepository, invokeSummonWaitingList } from './SummonAuthority'

type Props = {
	family: string
}

export function researchSummonable({ family }: Props) {
	const repository = invokeSummoningRepository()
	const waitingList = invokeSummonWaitingList()
	repository[family] = []
	waitingList[family] = []

	const summon = (target: HTMLElement) => {
		const event = { isHandled: false }
		dispatchEvent({
			event: 'summonable/requestSummon',
			params: {
				family,
				element: target,
				event,
			},
		})

		if (!event.isHandled) {
			waitingList[family].push(target)
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

		waitingList[family] = waitingList[family].filter((e) => e !== element)
	}

	function Summonable({ children }: { children: ReactNode }) {
		const [targetElement, setTargetElement] = useState<HTMLElement | undefined>(undefined)
		const targetElementRef = useAutoRef(targetElement)

		useEventBusSubscribe({
			event: 'summonable/requestSummon',
			callback: (params) => {
				targetElementRef.current = params.element
				setTargetElement(params.element)
				params.event.isHandled = true
			},
		})

		useEffect(() => {
			const currentTarget = waitingList[family].pop()
			setTargetElement(currentTarget)
			targetElementRef.current = currentTarget

			return () => {
				if (targetElementRef.current) {
					waitingList[family].push(targetElementRef.current)
				}
			}
		}, [targetElementRef])

		useEventBusSubscribe({
			event: 'summonable/requestDismiss',
			condition: (params) => params.family === family && params.element === targetElementRef.current,
			callback: () => {
				targetElementRef.current = undefined
				setTargetElement(undefined)

				const newTarget = waitingList[family].pop()
				setTargetElement(newTarget)
				targetElementRef.current = newTarget
			},
		})

		if (!targetElement) {
			return null
		}

		return createPortal(children, targetElement)
	}

	function SummoningPortal() {
		const ref = useRef<HTMLDivElement | null>(null)
		useEffect(() => {
			const currentElement = ref.current
			if (currentElement) {
				summon(currentElement)
				return () => {
					release(currentElement)
				}
			}
		}, [])

		return <Box ref={ref}></Box>
	}

	return {
		Summonable,
		SummoningPortal,
	}
}
