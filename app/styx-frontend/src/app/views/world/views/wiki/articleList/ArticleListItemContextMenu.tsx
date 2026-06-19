import MoreVert from '@mui/icons-material/MoreVert'
import Button from '@mui/material/Button'
import { SxProps } from '@mui/material/styles'

import { useCustomTheme } from '@/app/features/theming/hooks/useCustomTheme'

import { BoxedWikiEntity } from '../hooks/useBoxedWikiContent'
import { ArticleListHeaderCreateButton } from './ArticleListHeaderCreateButton'

type Props = {
	article: BoxedWikiEntity
	color: string
	onContextMenu: (article: BoxedWikiEntity, event: React.MouseEvent) => void
	isContextMenuOpen: boolean
}

export function ArticleListItemContextMenu({ article, onContextMenu, isContextMenuOpen }: Props) {
	const theme = useCustomTheme()

	const buttonSx: SxProps = {
		position: 'absolute',
		top: 0,
		bottom: 0,
		width: 36,
		minWidth: 0,
		height: 'auto',
		borderRadius: '8px',
		color: theme.custom.palette.hintText,
		'&:hover': {
			backgroundColor: 'action.hover',
		},
		transition: 'color 0.2s, background-color 0.2s, opacity 0.15s !important',
		padding: 0,
	}

	return (
		<>
			{article.type === 'folder' && (
				<ArticleListHeaderCreateButton
					folderId={article.id}
					slotProps={{
						primaryButton: {
							className: 'context-menu-button',
							disableElevation: true,
						},
					}}
					buttonSx={{
						...buttonSx,
						right: 36,
						opacity: isContextMenuOpen ? 1 : 0,
						backgroundColor: 'transparent',
					}}
				/>
			)}
			<Button
				aria-label="Article context menu"
				className="context-menu-button"
				onClick={(event) => {
					onContextMenu(article, event)
					event.stopPropagation()
				}}
				onContextMenu={(event) => {
					onContextMenu(article, event)
					event.preventDefault()
				}}
				color="inherit"
				onMouseDown={(event) => event.stopPropagation()}
				sx={{
					...buttonSx,
					right: 0,
					opacity: isContextMenuOpen ? 1 : 0,
					backgroundColor: isContextMenuOpen ? 'action.hover' : 'transparent',
				}}
			>
				<MoreVert />
			</Button>
		</>
	)
}
