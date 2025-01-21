import { useEffect, useState } from 'react'

import { OnChangeParams } from '@/app/features/richTextEditor/RichTextEditor'
import { RichTextEditorWithFallback } from '@/app/features/richTextEditor/RichTextEditorWithFallback'
import { useAutosave } from '@/app/utils/autosave/useAutosave'

import { useEditArticle } from '../../api/useEditArticle'
import { useCurrentArticle } from '../../hooks/useCurrentArticle'

export const ArticleDetails = () => {
	const { article } = useCurrentArticle()
	const [editArticle, { isLoading: isSaving }] = useEditArticle()

	const [content, setContent] = useState('')

	const { autosave, manualSave } = useAutosave({
		onSave: () => {
			if (!article || content === article.contentRich) {
				return
			}
			editArticle({
				id: article.id,
				contentRich: content,
			})
		},
		isSaving,
	})

	useEffect(() => {
		setContent(article?.contentRich ?? '')
	}, [article])

	const onChange = (params: OnChangeParams) => {
		setContent(params.richText)
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
