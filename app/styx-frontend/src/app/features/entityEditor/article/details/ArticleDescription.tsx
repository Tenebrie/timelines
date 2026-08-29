import Box from '@mui/material/Box'
import debounce from 'lodash.debounce'
import { useCallback, useRef } from 'react'

import { useWikiApiCache } from '@/api/hooks/useWikiApiCache'
import { WikiArticle } from '@/api/types/worldWikiTypes'
import { RichTextEditorSummoner } from '@/app/features/richTextEditor/portals/RichTextEditorPortal'
import { useBrowserSpecificScrollbars } from '@/app/hooks/useBrowserSpecificScrollbars'

type Props = {
	article: WikiArticle
	surface?: string
}

export const ArticleDescription = ({ article, surface }: Props) => {
	const { updateCachedArticle } = useWikiApiCache()

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
				value={article.contentRich}
				onChange={handleChange}
				allowReadMode
				surface={surface}
				collaboration={{
					entityType: 'article',
					documentId: article.id,
				}}
			/>
		</Box>
	)
}
