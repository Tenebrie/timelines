import Article from '@mui/icons-material/Article'
import Folder from '@mui/icons-material/Folder'
import Menu from '@mui/icons-material/Menu'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import Collapse from '@mui/material/Collapse'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import { useMatches } from '@tanstack/react-router'
import { bindTrigger, usePopupState } from 'material-ui-popup-state/hooks'
import { memo, useCallback, useMemo } from 'react'

import { WikiArticle } from '@/api/types/worldWikiTypes'
import { useIsReadOnly } from '@/app/views/world/hooks/useIsReadOnly'
import { useArticleBulkActions } from '@/app/views/world/views/wiki/hooks/useArticleBulkActions'
import { useArticleDragDrop } from '@/app/views/world/views/wiki/hooks/useArticleDragDrop'
import { useStableNavigate } from '@/router-utils/hooks/useStableNavigate'

import { ArticleContextMenu } from '../../components/ArticleContextMenu'
import { useArticleCollapseControls } from '../hooks/useArticleCollapseControls'
import { ArticleList } from './ArticleList'
import { ArticleListItemCollapse } from './ArticleListItemCollapse'

type Props = {
	article: WikiArticle
	depth: number
}

export const ArticleListItem = memo(ArticleListItemComponent)

function ArticleListItemComponent({ article, depth }: Props) {
	const { toggleOpen, collapsed } = useArticleCollapseControls(article)

	const matches = useMatches()
	const highlighted = matches.some(
		(match) =>
			match.routeId === '/world/$worldId/_world/wiki/_wiki/$articleId' &&
			match.params.articleId === article.id,
	)

	return (
		<ArticleListItemInner
			article={article}
			depth={depth}
			expanded={!collapsed}
			toggleOpen={toggleOpen}
			highlighted={highlighted}
		/>
	)
}

export const ArticleListItemInner = memo(ArticleListItemInnerComponent)

function ArticleListItemInnerComponent({
	article,
	depth,
	expanded,
	toggleOpen,
	highlighted,
}: Props & { expanded: boolean; toggleOpen: () => void; highlighted: boolean }) {
	const navigate = useStableNavigate({ from: '/world/$worldId' })

	const { isReadOnly } = useIsReadOnly()

	const onNavigate = useCallback(() => {
		if (highlighted) {
			toggleOpen()
		} else {
			navigate({
				to: '/world/$worldId/wiki/$articleId',
				params: { articleId: article.id },
				search: true,
			})
		}
	}, [article.id, highlighted, toggleOpen, navigate])

	const { ref, ghostElement } = useArticleDragDrop({ article })

	const popupState = usePopupState({ variant: 'popover', popupId: 'articleListItem' })
	const { checkboxVisible, checked, onChange } = useArticleBulkActions({ article })

	const isFolder = !!article.children?.length
	const icon = useMemo(() => (isFolder ? <Folder /> : <Article />), [isFolder])

	return (
		<Box
			data-testid={`ArticleListItem/${article.name}/${depth}`}
			data-item-type={isFolder ? 'folder' : 'article'}
		>
			<Stack ref={ref} direction="row" position={'relative'}>
				{checkboxVisible && <Checkbox size="small" checked={checked} onChange={onChange}></Checkbox>}
				<Button
					role="button"
					startIcon={icon}
					variant={highlighted ? 'contained' : 'text'}
					color="secondary"
					sx={{ justifyContent: 'start', paddingLeft: 1.5 }}
					fullWidth
					onClick={onNavigate}
				>
					{article.name}
				</Button>
				{!isReadOnly && (
					<IconButton
						aria-label="Article context menu"
						color="secondary"
						{...bindTrigger(popupState)}
						sx={{ flexShrink: 0 }}
					>
						<Menu />
					</IconButton>
				)}
				<ArticleListItemCollapse article={article} />
				<ArticleContextMenu article={article} popupState={popupState} />
				{ghostElement}
			</Stack>
			{article.children && article.children.length > 0 && (
				<Collapse in={expanded}>
					<ArticleList parentId={article.id} depth={depth + 1} />
				</Collapse>
			)}
		</Box>
	)
}
