import { v4 as uuidv4 } from 'uuid'

export type StoryEvent = {
	id: string
	name: string
	timestamp: number
}

export const createStoryEvent = (
	base: Partial<StoryEvent> & Pick<StoryEvent, 'name' | 'timestamp'>
): StoryEvent => {
	return {
		id: uuidv4(),
		...base,
	}
}
