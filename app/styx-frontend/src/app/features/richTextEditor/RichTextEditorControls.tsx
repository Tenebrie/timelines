import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import { Editor } from '@tiptap/react'
import { memo } from 'react'

import { useIsReadOnly } from '@/app/views/world/hooks/useIsReadOnly'

import { BlockquoteButton } from './components/controls/BlockquoteButton'
import { BoldButton } from './components/controls/BoldButton'
import { BulletListButton } from './components/controls/BulletListButton'
import { FontFamilySelect } from './components/controls/FontFamilySelect'
import { HeadingSelect } from './components/controls/HeadingSelect'
import { HorizontalRuleButton } from './components/controls/HorizontalRuleButton'
import { ItalicButton } from './components/controls/ItalicButton'
import { MentionActorButton } from './components/controls/MentionActorButton'
import { OrderedListButton } from './components/controls/OrderedListButton'
import { StrikethroughButton } from './components/controls/StrikethroughButton'
import { TableInsertButton } from './components/controls/TableInsertButton'
import { TextColorButton } from './components/controls/TextColorButton'
import { ToolbarDivider } from './components/controls/ToolbarDivider'
import { UnderlineButton } from './components/controls/UnderlineButton'

type Props = {
	editor: Editor | null
	allowReadMode?: boolean
}

export const RichTextEditorControls = memo(RichTextEditorControlsComponent)

export function RichTextEditorControlsComponent({ editor }: Props) {
	const { isReadOnly } = useIsReadOnly()

	if (!editor) {
		return null
	}

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
							<BoldButton editor={editor} />
							<ItalicButton editor={editor} />
							<UnderlineButton editor={editor} />
							<StrikethroughButton editor={editor} />
							<TextColorButton editor={editor} />
							<FontFamilySelect editor={editor} />
							<ToolbarDivider />
							<HeadingSelect editor={editor} />
							<BulletListButton editor={editor} />
							<OrderedListButton editor={editor} />
							<BlockquoteButton editor={editor} />
							<HorizontalRuleButton editor={editor} />
							<TableInsertButton editor={editor} />
							<ToolbarDivider />
							<MentionActorButton editor={editor} />
						</>
					)}
				</Stack>
			</Stack>
		</Paper>
	)
}
