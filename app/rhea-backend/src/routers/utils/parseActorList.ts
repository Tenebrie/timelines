import { ActorService } from '@src/services/ActorService'
import { BadRequestError } from 'tenebrie-framework'

export const parseActorList = async (actorIds: string[] | undefined) => {
	if (!actorIds) {
		return null
	}

	const targetActors = await ActorService.findActorsByIds(actorIds)
	if (targetActors.length < actorIds.length) {
		throw new BadRequestError('Invalid actor IDs')
	}

	return targetActors
}
