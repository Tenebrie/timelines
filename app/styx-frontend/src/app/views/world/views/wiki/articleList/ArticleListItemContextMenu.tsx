import Add from '@mui/icons-material/Add'
import MoreVert from '@mui/icons-material/MoreVert'
import Button from '@mui/material/Button'

import { useCustomTheme } from '@/app/features/theming/hooks/useCustomTheme'

import { BoxedWikiEntity } from '../hooks/useBoxedWikiContent'

type Props = {
	article: BoxedWikiEntity
	color: string
	onContextMenu: (article: BoxedWikiEntity, event: React.MouseEvent) => void
	isContextMenuOpen: boolean
}

export function ArticleListItemContextMenu({ article, color, onContextMenu, isContextMenuOpen }: Props) {
	const theme = useCustomTheme()

	return (
		<>
			{article.type === 'folder' && (
				<Button
					aria-label="Folder create menu"
					className="context-menu-button"
					onClick={(event) => {
						onContextMenu(article, event)
						event.stopPropagation()
					}}
					color="inherit"
					onMouseDown={(event) => event.stopPropagation()}
					sx={{
						position: 'absolute',
						right: 36,
						top: 0,
						bottom: 0,
						width: 36,
						minWidth: 0,
						height: 'auto',
						borderRadius: '8px',
						color: theme.custom.palette.hintText,
						opacity: isContextMenuOpen ? 1 : 0,
						backgroundColor: isContextMenuOpen ? 'action.hover' : 'transparent',
						'&:hover': {
							backgroundColor: 'action.hover',
						},
						transition: 'color 0.2s, background-color 0.2s, opacity 0.15s !important',
						padding: 0,
					}}
				>
					<Add />
				</Button>
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
					position: 'absolute',
					right: 0,
					top: 0,
					bottom: 0,
					width: 36,
					minWidth: 0,
					height: 'auto',
					borderRadius: '8px',
					color: color,
					opacity: isContextMenuOpen ? 1 : 0,
					backgroundColor: isContextMenuOpen ? 'action.hover' : 'transparent',
					'&:hover': {
						backgroundColor: 'action.hover',
					},
					transition: 'color 0.2s, background-color 0.2s, opacity 0.15s !important',
					padding: 0,
				}}
			>
				<MoreVert />
			</Button>
		</>
	)
}
