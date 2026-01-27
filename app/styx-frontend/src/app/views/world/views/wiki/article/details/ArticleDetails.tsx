import Box from '@mui/material/Box'
import { useState } from 'react'

import { useEventBusSubscribe } from '@/app/features/eventBus'
import { RichTextEditorSummoner } from '@/app/features/richTextEditor/portals/RichTextEditorPortal'
import { useCustomTheme } from '@/app/features/theming/hooks/useCustomTheme'
import { useBrowserSpecificScrollbars } from '@/app/hooks/useBrowserSpecificScrollbars'
import { useCurrentArticle } from '@/app/views/world/views/wiki/hooks/useCurrentArticle'

export const ArticleDetails = () => {
	const { article } = useCurrentArticle()
	const theme = useCustomTheme()

	const [key, setKey] = useState(0)

	useEventBusSubscribe['richEditor/forceUpdateArticle']({
		condition: (data) => data.articleId === article?.id,
		callback: () => setKey((prev) => prev + 1),
	})

	const scrollbars = useBrowserSpecificScrollbars()

	if (!article) {
		return <></>
	}

	return (
		<Box sx={{ ...scrollbars, height: '100%' }}>
			<RichTextEditorSummoner
				softKey={`${article.id}-${key}`}
				value={article.contentRich}
				onChange={() => {}}
				fadeInOverlayColor={theme.custom.palette.background.textEditor}
				allowReadMode
				collaboration={{
					worldId: article.worldId,
					entityType: 'article',
					documentId: article.id,
				}}
				isLoading={true}
			/>
		</Box>
	)
}
