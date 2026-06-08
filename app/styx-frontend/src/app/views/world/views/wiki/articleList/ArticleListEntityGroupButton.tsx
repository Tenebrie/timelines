import Button from '@mui/material/Button'
import ButtonGroup from '@mui/material/ButtonGroup'
import { memo } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { preferencesSlice } from '@/app/features/preferences/PreferencesSlice'
import { getWikiPreferences } from '@/app/features/preferences/PreferencesSliceSelectors'
import { EntityIcon } from '@/ui-lib/icons/EntityIcon'

export const ArticleListEntityGroupButton = memo(ArticleListEntityGroupButtonComponent)

function ArticleListEntityGroupButtonComponent() {
	const types = ['article', 'actor', 'event', 'tag'] satisfies (typeof visibleEntities)[number][]
	const typeLabels: Record<(typeof visibleEntities)[number], string> = {
		article: 'Articles',
		actor: 'Actors',
		event: 'Events',
		tag: 'Tags',
	}

	const { visibleEntities } = useSelector(
		getWikiPreferences,
		(a, b) => a.visibleEntities === b.visibleEntities,
	)

	const { setVisibleWikiEntities } = preferencesSlice.actions
	const dispatch = useDispatch()

	return (
		<ButtonGroup>
			{types.map((type) => (
				<Button
					key={type}
					variant={visibleEntities.includes(type) ? 'contained' : 'outlined'}
					onClick={() => {
						const newVisibleEntities = [...visibleEntities]
						if (visibleEntities.includes(type)) {
							newVisibleEntities.splice(newVisibleEntities.indexOf(type), 1)
						} else {
							newVisibleEntities.push(type)
						}
						dispatch(setVisibleWikiEntities(newVisibleEntities))
					}}
					startIcon={<EntityIcon variant={type} />}
					color="secondary"
				>
					{typeLabels[type]}
				</Button>
			))}
		</ButtonGroup>
	)
}
