import { useMatches } from '@tanstack/react-router'

import { FileRouteTypes } from '@/routeTree.gen'

export const useCheckRouteMatchExact = (route: FileRouteTypes['fullPaths']) => {
	return useMatches({
		select: (a) => a.some((a) => a.routeId === route),
	})
}
