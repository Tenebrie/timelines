import { WikiArticle } from '@api/types/worldWikiTypes'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import useEvent from 'react-use-event-hook'

import { useBrowserSpecificScrollbars } from '@/app/hooks/useBrowserSpecificScrollbars'
import { useEditArticle } from '@/app/views/world/views/wiki/api/useEditArticle'
import { EditableTitle } from '@/ui-lib/components/EditableTitle/EditableTitle'

import { EntityEditorTabs } from '../../common/EntityEditorTabs'
import { ArticleDescription } from './ArticleDescription'
import { ArticleBacklinks } from './components/ArticleBacklinks'

type Props = {
	article: WikiArticle
	titleProps?: Partial<Parameters<typeof EditableTitle>[0]>
	isWikiTab?: boolean
}

export const ArticleDetails = ({ article, titleProps, isWikiTab }: Props) => {
	const [editArticle] = useEditArticle()

	const onSave = useEvent((name: string) => {
		editArticle({ id: article.id, name })
	})

	const scrollbars = useBrowserSpecificScrollbars()

	return (
		<Stack
			gap={1}
			sx={{
				height: 'calc(100% - 1px)',
				...scrollbars,
			}}
		>
			<EditableTitle value={article.name} onSave={onSave} {...titleProps} />
			<Divider />
			<Box flexGrow={1} height={0}>
				<EntityEditorTabs
					contentTab={<ArticleDescription article={article} />}
					backlinksTab={<ArticleBacklinks articleId={article.id} />}
					isWikiTab={isWikiTab}
				/>
			</Box>
		</Stack>
	)
}
