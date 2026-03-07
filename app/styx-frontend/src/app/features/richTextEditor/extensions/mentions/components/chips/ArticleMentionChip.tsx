import { useSelector } from 'react-redux'

import { useEventBusDispatch } from '@/app/features/eventBus'
import { getWikiState } from '@/app/views/world/views/wiki/WikiSliceSelectors'

import { BaseMentionChip } from './BaseMentionChip'

type Props = {
	worldId: string
	articleId: string
	fallbackName?: string
}

export const ArticleMentionChip = ({ worldId, articleId, fallbackName }: Props) => {
	const navigateTo = useEventBusDispatch['world/requestNavigation']()
	const { articles } = useSelector(getWikiState, (a, b) => a.articles === b.articles)

	const article = articles.find((article) => article.id === articleId)
	const articleName = article ? `${article.name}` : `Deleted Article (${fallbackName ?? 'Unknown'})`
	const articleColor = article ? '#525' : undefined

	const onClick = () => {
		if (!article) {
			return
		}
		navigateTo({
			search: (prev) => {
				const navi = [...(prev.navi ?? [])] as string[]
				if (navi.length === 0 || !navi[navi.length - 1].includes(articleId)) {
					navi.push(articleId)
				}
				return { ...prev, navi, tab: 0 }
			},
		})
	}

	return <BaseMentionChip type="Article" label={articleName} color={articleColor} onClick={onClick} />
}
