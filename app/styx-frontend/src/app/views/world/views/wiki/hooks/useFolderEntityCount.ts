import { WikiEntityType } from '@api/types/worldTypes'
import { useSelector } from 'react-redux'

import { getWikiPreferences } from '@/app/features/preferences/PreferencesSliceSelectors'
import { RootState } from '@/app/store'

import { getWikiFolderCounts } from '../WikiSliceSelectors'

type Props = {
	id: string
	entityType: WikiEntityType
}

export function useFolderEntityCount({ id, entityType }: Props) {
	const { visibleEntities } = useSelector(
		getWikiPreferences,
		(a, b) => a.visibleEntities === b.visibleEntities,
	)

	return useSelector((state: RootState) => {
		if (entityType !== 'folder') {
			return null
		}
		const counts = getWikiFolderCounts(state).get(id)
		if (counts === undefined) {
			return null
		}

		const visible = visibleEntities.map((type) => counts[type] ?? 0).reduce((acc, val) => acc + val, 0)
		if (visible === counts.total) {
			return String(visible)
		}

		return `${visible} / ${counts.total}`
	})
}
