import { v4 as uuidv4 } from 'uuid'

import { StoryEvent, WorldStatement } from './types'

export const makeStoryEvent = (
	base: Partial<StoryEvent> & Pick<StoryEvent, 'name' | 'timestamp'>
): StoryEvent => ({
	id: uuidv4(),
	type: 'other',
	description: '',
	issuedWorldStatements: [],
	revokedWorldStatements: [],
	...base,
})

export const makeWorldStoryCard = (
	base: Partial<WorldStatement> & Pick<WorldStatement, 'name' | 'text'>
): WorldStatement => ({
	id: uuidv4(),
	...base,
})
