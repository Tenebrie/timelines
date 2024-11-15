import { useMemo } from 'react'

import { WorldEventModule } from '@/app/features/world/types'

export const useEventModules = () => {
	const options: { text: string; secondary: string; module: WorldEventModule }[] = useMemo(
		() => [
			{
				text: 'Resolved at',
				secondary: 'Specify the end-of-life timestamp for this event',
				module: 'RevokedAt',
			},
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
				text: 'External Link',
				secondary: 'Add a link to an external resource',
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
