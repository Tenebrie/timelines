import { useEffect, useRef, useState } from 'react'

import { useEventBusSubscribe } from '@/app/features/eventBus'
import { OnChangeParams } from '@/app/features/richTextEditor/RichTextEditor'
import { RichTextEditorWithFallback } from '@/app/features/richTextEditor/RichTextEditorWithFallback'
import { MentionDetails } from '@/app/features/worldTimeline/types'
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
	const skipNextAutosave = useRef(false)

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
		if (!article || skipNextAutosave.current) {
			skipNextAutosave.current = false
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

	useEffect(() => {
		skipNextAutosave.current = true
	}, [article?.id])

	useEventBusSubscribe({
		event: 'richEditor/forceUpdateArticle',
		condition: (data) => data.articleId === article?.id,
		callback: () => setKey((prev) => prev + 1),
	})

	if (!article) {
		return <></>
	}

	return (
		<RichTextEditorWithFallback
			softKey={`${article.id}-${key}`}
			value={article.contentRich}
			onChange={onChange}
			onBlur={manualSave}
			allowReadMode
		/>
	)
}
