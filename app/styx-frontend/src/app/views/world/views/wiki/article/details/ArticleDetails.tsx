import { MentionDetails } from '@api/types/worldTypes'
import Box from '@mui/material/Box'
import { useRef, useState } from 'react'

import { WikiArticle } from '@/api/types/worldWikiTypes'
import { useEventBusSubscribe } from '@/app/features/eventBus'
import { RichTextEditorSummoner } from '@/app/features/richTextEditor/portals/RichTextEditorPortal'
import { OnChangeParams } from '@/app/features/richTextEditor/RichTextEditor'
import { useCustomTheme } from '@/app/features/theming/hooks/useCustomTheme'
import { useBrowserSpecificScrollbars } from '@/app/hooks/useBrowserSpecificScrollbars'
import { useAutosave } from '@/app/utils/autosave/useAutosave'
import { useEditArticle } from '@/app/views/world/views/wiki/api/useEditArticle'
import { useCurrentArticle } from '@/app/views/world/views/wiki/hooks/useCurrentArticle'

type WikiArticleToSave = WikiArticle & {
	newMentions: MentionDetails[]
}

export const ArticleDetails = () => {
	const { article } = useCurrentArticle()
	const [editArticle, { isLoading: isSaving }] = useEditArticle()
	const theme = useCustomTheme()

	const [key, setKey] = useState(0)

	const articleToSave = useRef<WikiArticleToSave | null>(null)

	const { autosave, manualSave } = useAutosave({
		onSave: () => {
			const article = articleToSave.current
			if (!article) {
				return
			}
			editArticle({
				id: article.id,
				contentRich: article.contentRich,
				newMentions: article.newMentions,
			})
			articleToSave.current = null
		},
		isSaving,
	})

	const onChange = (params: OnChangeParams) => {
		if (!article) {
			return
		}
		articleToSave.current = {
			...article,
			contentRich: params.richText,
			newMentions: params.mentions,
		}
		if (article.contentRich === params.richText) {
			return
		}
		autosave()
	}

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
				value={''}
				onChange={onChange}
				onBlur={manualSave}
				fadeInOverlayColor={theme.custom.palette.background.textEditor}
				allowReadMode
				collaboration={{
					worldId: article.worldId,
					documentId: article.id,
				}}
			/>
		</Box>
	)
}
