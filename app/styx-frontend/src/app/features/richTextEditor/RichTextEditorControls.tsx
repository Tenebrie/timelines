import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useSearch } from '@tanstack/react-router'
import { Editor } from '@tiptap/react'
import { memo, useCallback, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import styled from 'styled-components'

import { useIsReadOnly } from '@/app/views/world/hooks/useIsReadOnly'
import { Button } from '@/ui-lib/components/Button/Button'

import { ReadModeToggle } from '../../views/world/views/wiki/components/ReadModeToggle'
import { dispatchGlobalEvent } from '../eventBus'
import { getWikiPreferences } from '../preferences/PreferencesSliceSelectors'
import { ActiveButtonIndicator } from './extensions/mentions/components/ActiveButtonIndicator'

type Props = {
	editor: Editor | null
	allowReadMode?: boolean
}

export const RichTextEditorControls = memo(RichTextEditorControlsComponent)

export function RichTextEditorControlsComponent({ editor, allowReadMode }: Props) {
	const { navi } = useSearch({ from: '/world/$worldId/_world' })
	const { readModeEnabled } = useSelector(
		getWikiPreferences,
		(a, b) => a.readModeEnabled === b.readModeEnabled,
	)
	const { isReadOnly } = useIsReadOnly()

	const [, setUpdateCounter] = useState(0)

	const forceUpdate = () => {
		setUpdateCounter((prev) => prev + 1)
	}

	useEffect(() => {
		if (!editor) {
			return
		}

		// Subscribe to editor events that should trigger re-renders
		editor.on('update', forceUpdate)
		editor.on('selectionUpdate', forceUpdate)
		editor.on('transaction', forceUpdate)

		return () => {
			editor.off('update', forceUpdate)
			editor.off('selectionUpdate', forceUpdate)
		}
	}, [editor])

	const isReadMode = isReadOnly || (readModeEnabled && allowReadMode && navi.length === 0)

	const isBold = editor?.isActive('bold') ?? false
	const isItalic = editor?.isActive('italic') ?? false
	const isUnderline = editor?.isActive('underline') ?? false
	const isStrikethrough = editor?.isActive('strike') ?? false

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
					{!isReadMode && (
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
							<Button onClick={onMentionActorClick} color="secondary">
								@Mention
							</Button>
						</>
					)}
					{isReadMode && (
						<Stack sx={{ height: '44px', alignItems: 'center', paddingLeft: '16px' }} direction="row">
							<Typography variant="body2" color="gray" sx={{ fontStyle: 'italic' }}>
								Read mode
							</Typography>
						</Stack>
					)}
				</Stack>
				<Stack
					sx={{
						alignSelf: 'stretch',
						alignItems: 'center',
						justifyContent: 'center',
					}}
				>
					{allowReadMode && !isReadOnly && <ReadModeToggle />}
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
