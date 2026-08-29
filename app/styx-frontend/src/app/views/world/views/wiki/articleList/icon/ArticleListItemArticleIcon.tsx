import { WikiArticle } from '@/api/types/worldWikiTypes'
import { useCustomTheme } from '@/app/features/theming/hooks/useCustomTheme'
import { useColorUtils } from '@/app/utils/colors/useColorUtils'
import { EntityIcon } from '@/ui-lib/icons/EntityIcon'

type Props = {
	article: WikiArticle
	highlighted: boolean
}

export function ArticleListItemArticleIcon({ article, highlighted }: Props) {
	const theme = useCustomTheme()
	const { adaptColor } = useColorUtils()

	const highlightBackground =
		theme.mode === 'dark' ? theme.material.palette.primary.dark : theme.material.palette.primary.main
	const background = highlighted ? highlightBackground : theme.material.palette.background.paper

	return <EntityIcon variant="article" height={24} color={adaptColor(article.color, background)} />
}
