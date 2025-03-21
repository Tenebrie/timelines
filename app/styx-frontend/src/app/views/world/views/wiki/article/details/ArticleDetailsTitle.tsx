import Button from '@mui/material/Button'
import Input from '@mui/material/Input'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useEffect, useState } from 'react'

import { Shortcut, useShortcut } from '@/app/hooks/useShortcut/useShortcut'
import { useEditArticle } from '@/app/views/world/views/wiki/api/useEditArticle'
import { useCurrentArticle } from '@/app/views/world/views/wiki/hooks/useCurrentArticle'

export const ArticleDetailsTitle = () => {
	const { article } = useCurrentArticle()
	const [editArticle] = useEditArticle()

	const [editing, setEditing] = useState(false)
	const [name, setName] = useState(article?.name)

	const applyChanges = () => {
		setEditing(false)
		if (!article || name === article.name) {
			return
		}
		editArticle({ id: article.id, name })
	}

	useShortcut([Shortcut.Enter, Shortcut.CtrlEnter], applyChanges, editing)
	useShortcut(
		[Shortcut.Escape],
		() => {
			setEditing(false)
			setName(article!.name)
		},
		editing,
	)

	useEffect(() => {
		setEditing(false)
	}, [article])

	if (!article) {
		return null
	}

	const onStartEdit = () => {
		setEditing(true)
		setName(article.name)
	}

	return (
		<Stack
			gap={1}
			direction="row"
			alignContent="center"
			width="100%"
			sx={{ height: '32px' }}
			data-testid="ArticleTitle"
		>
			{!editing && (
				<Stack direction="row" justifyContent="space-between" width="100%">
					<Button
						variant="text"
						sx={{ padding: '0 8px', width: '100%', justifyContent: 'flex-start' }}
						onClick={onStartEdit}
					>
						<Typography variant="h6" noWrap>
							{article.name}
						</Typography>
					</Button>
				</Stack>
			)}
			{editing && (
				<Input
					autoFocus
					value={name}
					onChange={(event) => setName(event.target.value)}
					onBlur={() => applyChanges()}
					role="textbox"
					sx={{
						width: '100%',
						marginBottom: '-9px',
						fontSize: '20px',
						fontWeight: 450,
						paddingLeft: '8px',
						paddingBottom: '8px',
					}}
				/>
			)}
		</Stack>
	)
}
