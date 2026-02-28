import { useCallback, useMemo } from 'react'

import { useStringColorResolver } from './useStringColor'

type Props = {
	id: string
	color: string | undefined
}

export function useEntityColor({ id, color }: Props) {
	const resolver = useEntityColorResolver()
	return useMemo(() => resolver({ id, color }), [id, color, resolver])
}

export function useEntityColorResolver() {
	const colorResolver = useStringColorResolver()
	return useCallback(
		({ id, color }: Props) => {
			const legacyColor = colorResolver(id)
			if (color && color !== '#000000') {
				return color
			}
			return color === '#000000' ? legacyColor : color
		},
		[colorResolver],
	)
}
