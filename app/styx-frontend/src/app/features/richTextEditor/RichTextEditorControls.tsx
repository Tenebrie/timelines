import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted'
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered'
import FormatQuoteIcon from '@mui/icons-material/FormatQuote'
import HorizontalRuleIcon from '@mui/icons-material/HorizontalRule'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import { Editor } from '@tiptap/react'
import { memo, useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'

import { useIsReadOnly } from '@/app/views/world/hooks/useIsReadOnly'
import { Button } from '@/ui-lib/components/Button/Button'

import { dispatchGlobalEvent } from '../eventBus'
import { FontFamilySelect } from './components/FontFamilySelect'
import { HeadingSelect } from './components/HeadingSelect'
import { TableInsertButton } from './components/TableInsertButton'
import { TextColorButton } from './components/TextColorButton'
import { ActiveButtonIndicator } from './extensions/mentions/components/ActiveButtonIndicator'

type Props = {
	editor: Editor | null
	allowReadMode?: boolean
}

export const RichTextEditorControls = memo(RichTextEditorControlsComponent)

export function RichTextEditorControlsComponent({ editor }: Props) {
	const { isReadOnly } = useIsReadOnly()

	const [, setUpdateCounter] = useState(0)

	const forceUpdate = () => {
		setUpdateCounter((prev) => prev + 1)
	}

	useEffect(() => {
		if (!editor) {
			return
		}

		editor.on('update', forceUpdate)
		editor.on('selectionUpdate', forceUpdate)
		editor.on('transaction', forceUpdate)

		return () => {
			editor.off('update', forceUpdate)
			editor.off('selectionUpdate', forceUpdate)
		}
	}, [editor])

	const isBold = editor?.isActive('bold') ?? false
	const isItalic = editor?.isActive('italic') ?? false
	const isUnderline = editor?.isActive('underline') ?? false
	const isStrikethrough = editor?.isActive('strike') ?? false
	const isBulletList = editor?.isActive('bulletList') ?? false
	const isOrderedList = editor?.isActive('orderedList') ?? false
	const isBlockquote = editor?.isActive('blockquote') ?? false

	const onBoldClick = useCallback(() => {
		editor?.chain().focus().toggleBold().run()
		forceUpdate()
	}, [editor])

	const onItalicClick = useCallback(() => {
		editor?.chain().focus().toggleItalic().run()
		forceUpdate()
	}, [editor])

	const onUnderlineClick = useCallback(() => {
		editor?.chain().focus().toggleUnderline().run()
		forceUpdate()
	}, [editor])

	const onStrikeClick = useCallback(() => {
		editor?.chain().focus().toggleStrike().run()
		forceUpdate()
	}, [editor])

	const onBulletListClick = useCallback(() => {
		editor?.chain().focus().toggleBulletList().run()
		forceUpdate()
	}, [editor])

	const onOrderedListClick = useCallback(() => {
		editor?.chain().focus().toggleOrderedList().run()
		forceUpdate()
	}, [editor])

	const onBlockquoteClick = useCallback(() => {
		editor?.chain().focus().toggleBlockquote().run()
		forceUpdate()
	}, [editor])

	const onHorizontalRuleClick = useCallback(() => {
		editor?.chain().focus().setHorizontalRule().run()
		forceUpdate()
	}, [editor])

	const onMentionActorClick = useCallback(() => {
		if (!editor) {
			return
		}

		const pos = editor.state.selection.$head.pos
		if (editor.state.doc.textBetween(pos - 1, pos) !== ' ') {
			editor.chain().focus().insertContent(' ').run()
		}
		editor.chain().focus().insertContent('@').run()
		const visualPos = editor.view.coordsAtPos(editor.state.selection.from)
		dispatchGlobalEvent['richEditor/requestOpenMentions']({
			query: '',
			screenPosTop: visualPos.top,
			screenPosBottom: visualPos.bottom,
			screenPosLeft: visualPos.left,
		})
	}, [editor])

	return (
		<Paper
			sx={{
				borderRadius: '6px 6px 0 0',
				backgroundImage: (theme) =>
					theme.palette.mode === 'dark'
						? 'linear-gradient(rgba(255,255,255,0.043), rgba(255,255,255,0.043))'
						: 'none',
				boxShadow: (theme) =>
					theme.palette.mode === 'light'
						? '0 2px 4px -1px rgba(0,0,0,0.07), 0 1px 2px -1px rgba(0,0,0,0.02)'
						: 'none',
			}}
		>
			<Stack direction="row" justifyContent="space-between">
				<Stack direction="row" flexWrap={'wrap'}>
					{!isReadOnly && (
						<>
							<Tooltip title="Bold" disableInteractive enterDelay={500}>
								<StyledSmallButton onClick={onBoldClick} color="secondary">
									<b>B</b>
									<ActiveButtonIndicator active={isBold} />
								</StyledSmallButton>
							</Tooltip>
							<Tooltip title="Italic" disableInteractive enterDelay={500}>
								<StyledSmallButton onClick={onItalicClick} color="secondary">
									<i>I</i>
									<ActiveButtonIndicator active={isItalic} />
								</StyledSmallButton>
							</Tooltip>
							<Tooltip title="Underline" disableInteractive enterDelay={500}>
								<StyledSmallButton onClick={onUnderlineClick} color="secondary">
									<u>U</u>
									<ActiveButtonIndicator active={isUnderline} />
								</StyledSmallButton>
							</Tooltip>
							<Tooltip title="Strikethrough" disableInteractive enterDelay={500}>
								<StyledSmallButton
									onClick={onStrikeClick}
									color="secondary"
									sx={{ textDecoration: 'line-through !important' }}
								>
									S
									<ActiveButtonIndicator active={isStrikethrough} />
								</StyledSmallButton>
							</Tooltip>
							{editor && <TextColorButton editor={editor} />}
							{editor && <FontFamilySelect editor={editor} />}
							<ToolbarDivider />
							{editor && <HeadingSelect editor={editor} />}
							<Tooltip title="Bullet list" disableInteractive enterDelay={500}>
								<StyledSmallButton onClick={onBulletListClick} color="secondary">
									<FormatListBulletedIcon fontSize="small" />
									<ActiveButtonIndicator active={isBulletList} />
								</StyledSmallButton>
							</Tooltip>
							<Tooltip title="Numbered list" disableInteractive enterDelay={500}>
								<StyledSmallButton onClick={onOrderedListClick} color="secondary">
									<FormatListNumberedIcon fontSize="small" />
									<ActiveButtonIndicator active={isOrderedList} />
								</StyledSmallButton>
							</Tooltip>
							<Tooltip title="Blockquote" disableInteractive enterDelay={500}>
								<StyledSmallButton onClick={onBlockquoteClick} color="secondary">
									<FormatQuoteIcon fontSize="small" />
									<ActiveButtonIndicator active={isBlockquote} />
								</StyledSmallButton>
							</Tooltip>
							<Tooltip title="Horizontal rule" disableInteractive enterDelay={500}>
								<StyledSmallButton onClick={onHorizontalRuleClick} color="secondary">
									<HorizontalRuleIcon fontSize="small" />
								</StyledSmallButton>
							</Tooltip>
							{editor && <TableInsertButton editor={editor} />}
							<ToolbarDivider />
							<Button onClick={onMentionActorClick} color="secondary">
								@Mention
							</Button>
						</>
					)}
				</Stack>
			</Stack>
		</Paper>
	)
}

const StyledSmallButton = styled(Button)`
	min-height: 44px !important;
	min-width: 40px !important;
	padding: 0;
	font-family: 'Roboto Mono' !important;
`

function ToolbarDivider() {
	return <Divider orientation="vertical" flexItem sx={{ mx: '4px', my: '8px' }} />
}
