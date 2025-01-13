import { ActorService } from '@src/services/ActorService'
import { BadRequestError } from 'moonflower'

export const parseActorList = async (actorIds: string[] | undefined) => {
	if (!actorIds) {
		return null
	}

	const deduplicatedActorIds = Array.from(new Set(actorIds))

	const targetActors = await ActorService.findActorsByIds(deduplicatedActorIds)
	if (targetActors.length < deduplicatedActorIds.length) {
		throw new BadRequestError('Invalid actor IDs')
	}

	return targetActors
}
