import Box from '@mui/material/Box'
import debounce from 'lodash.debounce'
import { useCallback, useRef } from 'react'

import { RichTextEditorSummoner } from '@/app/features/richTextEditor/portals/RichTextEditorPortal'
import { useCustomTheme } from '@/app/features/theming/hooks/useCustomTheme'
import { useBrowserSpecificScrollbars } from '@/app/hooks/useBrowserSpecificScrollbars'
import { useArticleApiCache } from '@/app/views/world/views/wiki/api/useArticleApiCache'
import { useCurrentArticle } from '@/app/views/world/views/wiki/hooks/useCurrentArticle'

export const ArticleDetails = () => {
	const { article } = useCurrentArticle()
	const theme = useCustomTheme()
	const { updateCachedArticle } = useArticleApiCache()

	const debouncedUpdate = useRef(
		debounce((articleId: string, richText: string) => {
			updateCachedArticle({
				id: articleId,
				contentRich: richText,
			})
		}, 2000),
	)

	const scrollbars = useBrowserSpecificScrollbars()

	const handleChange = useCallback(
		({ richText }: { richText: string }) => {
			if (!article) {
				return
			}
			debouncedUpdate.current(article.id, richText)
		},
		[article],
	)

	if (!article) {
		return <></>
	}

	return (
		<Box sx={{ ...scrollbars, height: '100%' }}>
			<RichTextEditorSummoner
				softKey={`${article.id}`}
				value={article.contentRich}
				onChange={handleChange}
				fadeInOverlayColor={theme.custom.palette.background.textEditor}
				allowReadMode
				collaboration={{
					entityType: 'article',
					documentId: article.id,
				}}
			/>
		</Box>
	)
}
