import Box from '@mui/material/Box'
import { useRef, useState } from 'react'

import { useEventBusSubscribe } from '@/app/features/eventBus'
import { RichTextEditorPortalSlot } from '@/app/features/richTextEditor/portals/RichTextEditorPortalSlot'
import { OnChangeParams } from '@/app/features/richTextEditor/RichTextEditor'
import { MentionDetails } from '@/app/features/worldTimeline/types'
import { useBrowserSpecificScrollbars } from '@/app/hooks/useBrowserSpecificScrollbars'
import { useAutosave } from '@/app/utils/autosave/useAutosave'

import { useEditArticle } from '../../api/useEditArticle'
import { useCurrentArticle } from '../../hooks/useCurrentArticle'
import { WikiArticle } from '../../types'

type WikiArticleToSave = WikiArticle & {
	newMentions: MentionDetails[]
}

export const ArticleDetails = () => {
	const { article } = useCurrentArticle()
	const [editArticle, { isLoading: isSaving }] = useEditArticle()

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

	useEventBusSubscribe({
		event: 'richEditor/forceUpdateArticle',
		condition: (data) => data.articleId === article?.id,
		callback: () => setKey((prev) => prev + 1),
	})

	const scrollbars = useBrowserSpecificScrollbars()

	if (!article) {
		return <></>
	}

	return (
		<Box sx={{ ...scrollbars, height: '100%' }}>
			<RichTextEditorPortalSlot
				softKey={`${article.id}-${key}`}
				value={article.contentRich}
				onChange={onChange}
				onBlur={manualSave}
				allowReadMode
			/>
		</Box>
	)
}
