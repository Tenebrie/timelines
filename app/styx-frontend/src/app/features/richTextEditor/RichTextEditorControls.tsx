import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { Editor } from '@tiptap/react'
import { memo, useCallback } from 'react'
import { useSelector } from 'react-redux'
import styled from 'styled-components'

import { useIsReadOnly } from '@/app/views/world/hooks/useIsReadOnly'

import { ReadModeToggle } from '../../views/world/views/wiki/components/ReadModeToggle'
import { getWikiPreferences } from '../preferences/PreferencesSliceSelectors'
import { ActiveButtonIndicator } from './extensions/mentions/components/ActiveButtonIndicator'

type Props = {
	editor: Editor | null
	allowReadMode?: boolean
}

export const RichTextEditorControls = memo(RichTextEditorControlsComponent)

export function RichTextEditorControlsComponent({ editor, allowReadMode }: Props) {
	const { readModeEnabled } = useSelector(
		getWikiPreferences,
		(a, b) => a.readModeEnabled === b.readModeEnabled,
	)
	const { isReadOnly } = useIsReadOnly()

	const isReadMode = isReadOnly || (readModeEnabled && allowReadMode)

	const isBold = editor?.isActive('bold') ?? false
	const isItalic = editor?.isActive('italic') ?? false
	const isUnderline = editor?.isActive('underline') ?? false
	const isStrikethrough = editor?.isActive('strike') ?? false

	const onBoldClick = useCallback(() => {
		editor?.chain().focus().toggleBold().run()
	}, [editor])

	const onItalicClick = useCallback(() => {
		editor?.chain().focus().toggleItalic().run()
	}, [editor])

	const onUnderlineClick = useCallback(() => {
		editor?.chain().focus().toggleUnderline().run()
	}, [editor])

	const onStrikeClick = useCallback(() => {
		editor?.chain().focus().toggleStrike().run()
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
	}, [editor])

	// const onImageClick = useCallback(() => {
	// 	editor?.chain().focus().setImage().run()
	// }, [editor])

	return (
		<Paper sx={{ padding: '4px 8px' }}>
			<Stack direction="row" justifyContent="space-between">
				<Stack direction="row" gap={0.75} flexWrap={'wrap'}>
					{!isReadMode && (
						<>
							<Tooltip title="Bold">
								<StyledSmallButton onClick={onBoldClick} color="secondary">
									<b>B</b>
									<ActiveButtonIndicator active={isBold} />
								</StyledSmallButton>
							</Tooltip>
							<Tooltip title="Italic">
								<StyledSmallButton onClick={onItalicClick} color="secondary">
									<i>I</i>
									<ActiveButtonIndicator active={isItalic} />
								</StyledSmallButton>
							</Tooltip>
							<Tooltip title="Underline">
								<StyledSmallButton onClick={onUnderlineClick} color="secondary">
									<u>U</u>
									<ActiveButtonIndicator active={isUnderline} />
								</StyledSmallButton>
							</Tooltip>
							<Tooltip title="Strikethrough">
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
						<Stack sx={{ height: '100%', alignItems: 'center' }} direction="row">
							<Typography variant="body2" color="gray" sx={{ fontStyle: 'italic' }}>
								Read mode
							</Typography>
						</Stack>
					)}
				</Stack>
				{allowReadMode && !isReadOnly && <ReadModeToggle />}
			</Stack>
		</Paper>
	)
}

const StyledSmallButton = styled(Button)`
	min-width: 32px !important;
	padding: 0;
	font-family: 'Roboto Mono' !important;
`
