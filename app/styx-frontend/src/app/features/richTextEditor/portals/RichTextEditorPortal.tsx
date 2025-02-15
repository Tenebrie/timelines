import { memo, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

import { RichTextEditorProps } from '../RichTextEditor'
import { RichTextEditorWithFallback } from '../RichTextEditorWithFallback'

export let SetPortalPosition: (position: HTMLElement | null, props: RichTextEditorProps) => void = () => {}

export const RichTextEditorPortal = memo(RichTextEditorPortalComponent)

export function RichTextEditorPortalComponent() {
	const [portalPosition, setPortalPosition] = useState<HTMLElement | null>(null)
	const [portalProps, setPortalProps] = useState<RichTextEditorProps | null>(null)

	useEffect(() => {
		SetPortalPosition = (position, props) => {
			setPortalPosition(position)
			setPortalProps(props)
		}
	}, [setPortalPosition])

	if (!portalPosition || !portalProps) {
		return null
	}

	return createPortal(<RichTextEditorWithFallback {...portalProps} />, portalPosition)
}
