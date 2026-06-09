import { useCallback, useMemo } from 'react'

import { useStringColorResolver } from './useStringColor'

type Props = {
	id: string
	color: string | undefined
	opacity?: number
}

function applyOpacity(color: string, opacity: number): string {
	if (color.startsWith('hsl(')) {
		return color.replace('hsl(', 'hsla(').replace(')', `, ${opacity})`)
	}
	const alpha = Math.round(opacity * 255)
		.toString(16)
		.padStart(2, '0')
	return `${color}${alpha}`
}

export function useEntityColor({ id, color, opacity }: Props) {
	const resolver = useEntityColorResolver()
	return useMemo(() => resolver({ id, color, opacity }), [id, color, opacity, resolver])
}

export function useEntityColorResolver() {
	const colorResolver = useStringColorResolver()
	return useCallback(
		({ id, color, opacity }: Props) => {
			const legacyColor = colorResolver(id)
			let resolvedColor: string | undefined
			if (color && color !== '#000000') {
				resolvedColor = color
			} else {
				resolvedColor = color === '#000000' ? legacyColor : color
			}
			if (opacity !== undefined && resolvedColor) {
				return applyOpacity(resolvedColor, opacity)
			}
			return resolvedColor
		},
		[colorResolver],
	)
}
