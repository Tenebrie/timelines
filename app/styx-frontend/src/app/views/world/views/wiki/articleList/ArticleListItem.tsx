import Menu from '@mui/icons-material/Menu'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import Collapse from '@mui/material/Collapse'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import { useMatches } from '@tanstack/react-router'
import { memo, useCallback } from 'react'
import { useSelector } from 'react-redux'

import { RootState } from '@/app/store'
import { useIsReadOnly } from '@/app/views/world/hooks/useIsReadOnly'
import { useArticleDragDrop } from '@/app/views/world/views/wiki/hooks/useArticleDragDrop'
import { useStableNavigate } from '@/router-utils/hooks/useStableNavigate'
import { EntityIcon } from '@/ui-lib/icons/EntityIcon'

import { BoxedWikiEntity } from '../hooks/useBoxedWikiContent'
import { ArticleList } from './ArticleList'
import { ArticleListItemCollapse } from './ArticleListItemCollapse'
import { useArticleCollapseControls } from './hooks/useArticleCollapseControls'

type Props = {
	article: BoxedWikiEntity
	depth: number
	checkboxVisible: boolean
	checked: boolean
	onCheckboxChange: (article: BoxedWikiEntity, event: React.ChangeEvent<HTMLInputElement>) => void
	onContextMenu: (article: BoxedWikiEntity, event: React.MouseEvent) => void
}

export const ArticleListItem = memo(ArticleListItemComponent)

function ArticleListItemComponent({ article, ...props }: Props) {
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
			expanded={!collapsed}
			toggleOpen={toggleOpen}
			highlighted={highlighted}
			{...props}
		/>
	)
}

export const ArticleListItemInner = memo(ArticleListItemInnerComponent)

function ArticleListItemInnerComponent({
	article,
	depth,
	expanded,
	checkboxVisible,
	checked,
	onCheckboxChange,
	toggleOpen,
	highlighted,
	onContextMenu,
}: Props & { expanded: boolean; toggleOpen: () => void; highlighted: boolean }) {
	const navigate = useStableNavigate({ from: '/world/$worldId' })

	const { isReadOnly } = useIsReadOnly()

	const onNavigate = useCallback(() => {
		if (highlighted || article.type === 'folder') {
			toggleOpen()
		} else {
			navigate({
				to: '/world/$worldId/wiki/$articleId',
				params: { articleId: article.id },
				search: true,
			})
		}
	}, [highlighted, article.type, article.id, toggleOpen, navigate])

	const { ref, ghostElement } = useArticleDragDrop({ article })
	const isGrayscale = useIsFolderGrayedOut(article)

	return (
		<Box data-testid={`ArticleListItem/${article.name}/${depth}`} data-item-type={article.type}>
			<Stack ref={ref} direction="row" position={'relative'}>
				{checkboxVisible && (
					<Checkbox
						size="small"
						checked={checked}
						onChange={(event) => onCheckboxChange(article, event)}
					></Checkbox>
				)}
				<Button
					role="button"
					startIcon={<EntityIcon variant={article.type} />}
					variant={highlighted ? 'contained' : 'text'}
					color="secondary"
					sx={{ justifyContent: 'start', paddingLeft: 1.5, filter: isGrayscale ? 'grayscale(100%)' : 'none' }}
					fullWidth
					onClick={onNavigate}
				>
					<Stack direction="row" justifyContent="space-between" sx={{ width: '100%', alignItems: 'center' }}>
						<span>{article.name}</span>
					</Stack>
				</Button>
				{article.type === 'folder' && <ArticleListItemCollapse entity={article} />}
				{!isReadOnly && (
					<IconButton
						aria-label="Article context menu"
						color="secondary"
						onClick={(event) => onContextMenu(article, event)}
						sx={{ flexShrink: 0 }}
					>
						<Menu />
					</IconButton>
				)}
				{ghostElement}
			</Stack>
			{article.type === 'folder' && (
				<Collapse in={expanded}>
					<ArticleList parentId={article.id} depth={depth + 1} />
				</Collapse>
			)}
		</Box>
	)
}

function useIsFolderGrayedOut(article: BoxedWikiEntity) {
	const folderId = article.type === 'folder' ? article.id : null

	return useSelector((state: RootState) => {
		if (!folderId) {
			return false
		}

		const { folders, articles } = state.wiki
		const { actors, events, tags } = state.world
		const { visibleEntities } = state.preferences.wiki

		function hasVisibleEntity(id: string): boolean {
			if (
				(visibleEntities.includes('actor') && actors.some((a) => a.parentFolderId === id)) ||
				(visibleEntities.includes('article') && articles.some((a) => a.parentFolderId === id)) ||
				(visibleEntities.includes('event') && events.some((e) => e.parentFolderId === id)) ||
				(visibleEntities.includes('tag') && tags.some((t) => t.parentFolderId === id))
			) {
				return true
			}
			return folders.filter((f) => f.parentFolderId === id).some((f) => hasVisibleEntity(f.id))
		}

		return !hasVisibleEntity(folderId)
	})
}
