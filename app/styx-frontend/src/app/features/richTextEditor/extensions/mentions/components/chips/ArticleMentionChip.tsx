import { useEventBusDispatch } from '@/app/features/eventBus'
import { getWikiState } from '@/app/features/worldWiki/selectors'

import { BaseMentionChip } from './BaseMentionChip'

type Props = {
	worldId: string
	articleId: string
	articles: ReturnType<typeof getWikiState>['articles']
}

export const ArticleMentionChip = ({ worldId, articleId, articles }: Props) => {
	const navigateTo = useEventBusDispatch({
		event: 'navigate/world',
	})

	const article = articles.find((article) => article.id === articleId)
	const articleName = article ? `${article.name}` : 'Unknown Article'
	const articleColor = article ? '#525' : undefined

	const onClick = () => {
		if (!article) {
			return
		}

		navigateTo({
			to: '/world/$worldId/wiki/$articleId',
			params: { worldId, articleId },
		})
	}

	return <BaseMentionChip type="Article" label={articleName} color={articleColor} onClick={onClick} />
}
