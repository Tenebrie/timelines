import { ActorService } from '@src/services/ActorService'
import { BadRequestError } from 'moonflower'

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
