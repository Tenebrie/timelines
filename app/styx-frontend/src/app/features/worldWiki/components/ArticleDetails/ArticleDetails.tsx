import { useEffect, useRef } from 'react'

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
		if (!article) {
			return
		}
		if (skipNextAutosave.current) {
			skipNextAutosave.current = false
			return
		}
		articleToSave.current = {
			...article,
			contentRich: params.richText,
			newMentions: params.mentions,
		}
		autosave()
	}

	useEffect(() => {
		skipNextAutosave.current = true
	}, [article?.id])

	if (!article) {
		return <></>
	}

	return (
		<RichTextEditorWithFallback
			key={article.id}
			value={article.contentRich}
			onChange={onChange}
			onBlur={manualSave}
			allowReadMode
		/>
	)
}
