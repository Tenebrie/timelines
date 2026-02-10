import { useSelector } from 'react-redux'

import { useEventBusDispatch } from '@/app/features/eventBus'
import { getWorldState } from '@/app/views/world/WorldSliceSelectors'

import { BaseMentionChip } from './BaseMentionChip'

type Props = {
	worldId: string
	tagId: string
}

export const TagMentionChip = ({ tagId }: Props) => {
	const navigateTo = useEventBusDispatch['world/requestNavigation']()
	const { tags } = useSelector(getWorldState, (a, b) => a.tags === b.tags)

	const tag = tags.find((tag) => tag.id === tagId)
	const tagName = tag ? `${tag.name}` : 'Unknown Tag'
	const tagColor = tag ? '#255' : undefined

	const onClick = () => {
		if (!tag) {
			return
		}
		navigateTo({
			search: (prev) => {
				const navi = [...(prev.navi ?? [])] as string[]
				if (navi.length === 0 || !navi[navi.length - 1].includes(tagId)) {
					navi.push(tagId)
				}
				return { ...prev, navi }
			},
		})
	}

	return <BaseMentionChip type="Tag" label={tagName} color={tagColor} onClick={onClick} />
}
