import { useEntityResolver } from './useEntityResolver'

export function useBreadcrumbEntities(entityStack: string[]) {
	const { resolveEntity } = useEntityResolver()

	return entityStack
		.map((entityId) => {
			const resolved = resolveEntity(entityId)
			if (!resolved) {
				return null
			}

			if (resolved.type === 'actor') {
				const actorName = resolved.entity.title
					? `${resolved.entity.name}, ${resolved.entity.title}`
					: resolved.entity.name
				return { type: 'actor', id: entityId, name: actorName } as const
			}

			return {
				type: resolved.type,
				id: entityId,
				name: resolved.entity.name,
			}
		})
		.filter((entity): entity is NonNullable<typeof entity> => entity !== null)
}
