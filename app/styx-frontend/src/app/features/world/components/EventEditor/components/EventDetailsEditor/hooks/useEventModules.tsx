import { useMemo } from 'react'

import { WorldEventModule } from '@/app/features/world/types'

export const useEventModules = () => {
	const options: { text: string; secondary: string; module: WorldEventModule }[] = useMemo(
		() => [
			{
				text: 'Icon',
				secondary: 'Choose a more interesting icon',
				module: 'EventIcon',
			},
			{
				text: 'Actors',
				secondary: 'Set the actors directly involved in this event',
				module: 'TargetActors',
			},
			{
				text: 'Mentioned actors',
				secondary: 'Set the actors mentioned in this event',
				module: 'MentionedActors',
			},
			{
				text: 'Resource link',
				secondary: 'Add a link to another resource, internal or external',
				module: 'ExternalLink',
			},
		],
		[],
	)

	return {
		optionCount: options.length,
		options,
	}
}
