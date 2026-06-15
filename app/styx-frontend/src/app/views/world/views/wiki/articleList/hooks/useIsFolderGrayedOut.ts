import { BoxedWikiEntity } from '../../hooks/useBoxedWikiContent'
import { useFolderEntityCount } from './useFolderEntityCount'

export function useIsFolderGrayedOut(article: BoxedWikiEntity) {
	const { visible } = useFolderEntityCount({ id: article.id, entityType: article.type })
	return article.type === 'folder' && visible === 0
}
