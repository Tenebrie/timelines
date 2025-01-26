import { ActorService } from '@src/services/ActorService'
import { BadRequestError } from 'moonflower'

export const parseActorList = async (actorIds: string[] | undefined) => {
	if (!actorIds) {
		return null
	}

	const deduplicatedActorIds = Array.from(new Set(actorIds))

	const actors = await ActorService.findActorsByIds(deduplicatedActorIds)
	if (actors.length < deduplicatedActorIds.length) {
		throw new BadRequestError('Invalid actor IDs')
	}

	return actors
}
