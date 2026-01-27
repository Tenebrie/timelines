import Box from '@mui/material/Box'
import { Editor } from '@tiptap/core'
import { EditorContent } from '@tiptap/react'
import { memo } from 'react'

import { useBrowserSpecificScrollbars } from '@/app/hooks/useBrowserSpecificScrollbars'

type Props = {
	editor: Editor
	mode: 'read' | 'edit'
	className?: string
	readOnly?: boolean
}

export const EditorContentBox = memo(EditorContentBoxComponent)

function EditorContentBoxComponent({ editor, mode, className, readOnly }: Props) {
	return (
		<Box
			component={EditorContent}
			className={className}
			editor={editor}
			readOnly={readOnly}
			sx={{
				fontFamily: '"Roboto", sans-serif',
				outline: 'none',
				height: mode === 'edit' ? 'calc(100% - 48px)' : 'unset',
				overflowY: 'auto',
				display: 'flex',
				flexDirection: 'column',

				'& img': {
					maxHeight: '400px',
					maxWidth: '100%',
				},

				'& .ProseMirror': {
					flex: 1,
					outline: 'none',
					minHeight: '1rem',
					height: '100%',
					padding: mode === 'edit' ? '0 16px' : 'unset',
					color: 'text.primary',

					'& > p:first-of-type': {
						paddingTop: '16px',
					},
				},

				'& p': {
					margin: 0,
					padding: '6px 0px',
					lineHeight: 1.5,
					wordBreak: 'break-word',
					color: 'text.primary',
				},

				'& li > p': {
					padding: '3px 0',
				},

				'& code': {
					padding: '4px 8px',
					borderRadius: '4px',
					background: '#00000033',
				},
				...useBrowserSpecificScrollbars(),
			}}
		/>
	)
}
