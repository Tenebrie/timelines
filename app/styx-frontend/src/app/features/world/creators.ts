import { v4 as uuidv4 } from 'uuid'

import { WorldEvent, WorldStatement } from './types'

export const makeStoryEvent = (
	base: Partial<WorldEvent> & Pick<WorldEvent, 'name' | 'timestamp'>
): WorldEvent => ({
	id: uuidv4(),
	type: 'OTHER',
	description: '',
	issuedStatements: [],
	revokedStatements: [],
	worldId: '',
	...base,
})

export const makeWorldStoryCard = (
	base: Partial<WorldStatement> & Pick<WorldStatement, 'title' | 'text'>
): WorldStatement => ({
	id: uuidv4(),
	...base,
})
