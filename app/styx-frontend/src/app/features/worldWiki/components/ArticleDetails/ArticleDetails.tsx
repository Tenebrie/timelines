import { useRef } from 'react'

import { OnChangeParams } from '@/app/features/richTextEditor/RichTextEditor'
import { RichTextEditorWithFallback } from '@/app/features/richTextEditor/RichTextEditorWithFallback'
import { useAutosave } from '@/app/utils/autosave/useAutosave'

import { useEditArticle } from '../../api/useEditArticle'
import { useCurrentArticle } from '../../hooks/useCurrentArticle'
import { WikiArticle } from '../../types'

export const ArticleDetails = () => {
	const { article } = useCurrentArticle()
	const [editArticle, { isLoading: isSaving }] = useEditArticle()

	const articleToSave = useRef<(WikiArticle & { mentionedActors: string[] }) | null>(null)

	const { autosave, manualSave } = useAutosave({
		onSave: () => {
			const article = articleToSave.current
			if (!article) {
				return
			}
			editArticle({
				id: article.id,
				contentRich: article.contentRich,
				mentionedActors: article.mentionedActors,
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
			mentionedActors: params.mentions,
		}
		autosave()
	}

	if (!article) {
		return null
	}

	return (
		<RichTextEditorWithFallback
			key={article.id}
			value={article.contentRich}
			onChange={onChange}
			onBlur={manualSave}
		/>
	)
}
