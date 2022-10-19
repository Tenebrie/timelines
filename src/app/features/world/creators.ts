import { v4 as uuidv4 } from 'uuid'

import { StoryEvent } from './types'

export const makeStoryEvent = (
	base: Partial<StoryEvent> & Pick<StoryEvent, 'name' | 'timestamp'>
): StoryEvent => {
	return {
		id: uuidv4(),
		type: 'other',
		description: '',
		...base,
	}
}
