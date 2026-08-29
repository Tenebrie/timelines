import { BoxedWikiEntity } from '../../hooks/useBoxedWikiContent'
import { ArticleListItemCollapse } from '../ArticleListItemCollapse'
import { ArticleListItemActorIcon } from './ArticleListItemActorIcon'
import { ArticleListItemArticleIcon } from './ArticleListItemArticleIcon'
import { ArticleListItemEventIcon } from './ArticleListItemEventIcon'
import { ArticleListItemFolderIcon } from './ArticleListItemFolderIcon'
import { ArticleListItemTagIcon } from './ArticleListItemTagIcon'

type Props = {
	article: BoxedWikiEntity
	highlighted: boolean
	folderCollapseIcon?: boolean
}

export function ArticleListItemIcon({ article, highlighted, folderCollapseIcon }: Props) {
	return (
		<>
			{article.type === 'folder' && folderCollapseIcon && <ArticleListItemCollapse entity={article} />}
			{article.type === 'folder' && !folderCollapseIcon && (
				<ArticleListItemFolderIcon folder={article.entity} highlighted={highlighted} />
			)}
			{article.type === 'article' && (
				<ArticleListItemArticleIcon article={article.entity} highlighted={highlighted} />
			)}
			{article.type === 'tag' && <ArticleListItemTagIcon tag={article.entity} highlighted={highlighted} />}
			{article.type === 'actor' && (
				<ArticleListItemActorIcon actor={article.entity} highlighted={highlighted} />
			)}
			{article.type === 'event' && (
				<ArticleListItemEventIcon event={article.entity} highlighted={highlighted} />
			)}
		</>
	)
}
