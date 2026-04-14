import { WorldTag } from '@api/types/worldTypes'
import { memo, useMemo } from 'react'
import { useSelector } from 'react-redux'

import { getOutlinerPreferences } from '@/app/features/preferences/PreferencesSliceSelectors'
import { useIsReadOnly } from '@/app/views/world/hooks/useIsReadOnly'

import { TagWithContentRenderer } from './OutlinerItemTag/TagWithContentRenderer'

export const OutlinerItemTag = memo(OutlinerItemTagComponent)

type Props = {
	tag: WorldTag
}

function OutlinerItemTagComponent({ tag }: Props) {
	const { isReadOnly } = useIsReadOnly()
	const actions = useMemo(() => {
		if (isReadOnly) {
			return ['collapse'] as const
		}
		return ['edit', 'collapse'] as const
	}, [isReadOnly])

	const { expandedTags } = useSelector(getOutlinerPreferences, (a, b) => a.expandedTags === b.expandedTags)

	return <TagWithContentRenderer collapsed={!expandedTags.includes(tag.id)} tag={tag} actions={actions} />
}
