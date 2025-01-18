import { useEffect, useMemo, useState } from 'react'

import { OnChangeParams } from '@/app/features/richTextEditor/RichTextEditor'
import { RichTextEditorWithFallback } from '@/app/features/richTextEditor/RichTextEditorWithFallback'
import { useWorldWikiRouter, worldWikiRoutes } from '@/router/routes/featureRoutes/worldWikiRoutes'

import { useListArticles } from '../../hooks/useListArticles'

export const Article = () => {
	const { stateOf } = useWorldWikiRouter()

	const [content, setContent] = useState('')

	const { data: articles } = useListArticles()

	const article = useMemo(() => {
		const { articleId } = stateOf(worldWikiRoutes.article)
		return articles?.find((a) => a.id === articleId)
	}, [articles, stateOf])

	useEffect(() => {
		setContent(article?.contentRich ?? '')
	}, [article])

	const onChange = (params: OnChangeParams) => {
		setContent(params.richText)
	}

	return <RichTextEditorWithFallback value={content} onChange={onChange} />
}
