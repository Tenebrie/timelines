import { useNavigate } from 'react-router-dom'

import { useEventBusSubscribe } from '@/app/features/eventBus'
import { worldTimelineQueryParams } from '@/router/routes/featureRoutes/worldTimelineRoutes'
import { QueryStrategy } from '@/router/types'

export const useNavigationReceiver = () => {
	const navigate = useNavigate()

	useEventBusSubscribe({
		event: 'navigate/worldTimeline',
		callback: ({ target, args, query }) => {
			const pathname = (() => {
				if (!args) {
					return target as string
				}

				return Object.keys(args).reduce(
					(total, current) => total.replace(`:${current}`, args[current as keyof typeof args]),
					target as string,
				)
			})()

			const evaluatedQuery1 = {
				...(worldTimelineQueryParams?.[target] ?? {}),
				...query,
			}
			const evaluatedQuery = evaluatedQuery1 as NonNullable<typeof evaluatedQuery1>

			const currentQuery = new URLSearchParams(window.location.search)

			const mappedQuery = (
				Array.from(currentQuery.entries()) as [string, string | number | null | undefined | QueryStrategy][]
			)
				.filter((entry) => evaluatedQuery[entry[0] as keyof typeof evaluatedQuery] === QueryStrategy.Preserve)
				.concat(
					Object.entries(evaluatedQuery).filter(
						(q) => q[1] !== undefined && q[1] !== QueryStrategy.Clear && q[1] !== QueryStrategy.Preserve,
					),
				)
				.filter((entry) => entry[1] !== null) as [string, string][]

			const search = mappedQuery.map((entry) => `${entry[0]}=${entry[1]}`).join('&')

			if (location.pathname === pathname && location.search === `?${search}`) {
				return
			}

			navigate({ pathname, search })
		},
	})

	// TODO: Merge with previous
	useEventBusSubscribe({
		event: 'navigate/articleDetails',
		callback: ({ target, args }) => {
			const pathname = (() => {
				if (!args) {
					return target as string
				}

				return Object.keys(args).reduce(
					(total, current) => total.replace(`:${current}`, args[current as keyof typeof args]),
					target as string,
				)
			})()

			if (location.pathname === pathname) {
				return
			}

			navigate({ pathname })
		},
	})
}
