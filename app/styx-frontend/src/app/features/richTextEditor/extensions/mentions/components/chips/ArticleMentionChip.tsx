import { useSelector } from 'react-redux'

import { useEventBusDispatch } from '@/app/features/eventBus'
import { getWorldIdState } from '@/app/features/world/selectors'
import { getWikiState } from '@/app/features/worldWiki/selectors'

import { BaseMentionChip } from './BaseMentionChip'

type Props = {
	articleId: string
}

export const ArticleMentionChip = ({ articleId }: Props) => {
	const worldId = useSelector(getWorldIdState)
	const { articles } = useSelector(getWikiState, (a, b) => a.articles === b.articles)
	const navigateTo = useEventBusDispatch({
		event: 'navigate/worldTimeline',
	})

	const article = articles.find((article) => article.id === articleId)
	const articleName = article ? `@${article.name}` : '@Unknown Article'
	const articleColor = article ? '#525' : undefined

	return <BaseMentionChip label={articleName} color={articleColor} onClick={() => {}} />
}
