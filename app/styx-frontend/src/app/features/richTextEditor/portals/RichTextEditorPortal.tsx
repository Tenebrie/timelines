import { memo, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { RichTextEditorProps } from '../RichTextEditor'
import { RichTextEditorWithFallback } from '../RichTextEditorWithFallback'

export let SetPortalPosition: (position: HTMLElement | null, props: RichTextEditorProps) => void = () => {}

export const RichTextEditorPortal = memo(RichTextEditorPortalComponent)

export function RichTextEditorPortalComponent() {
	const [portalPosition, setPortalPosition] = useState<HTMLElement | null>(null)
	const [portalProps, setPortalProps] = useState<RichTextEditorProps | null>(null)

	const containerRef = useRef<HTMLDivElement>(
		(() => {
			const element = document.createElement('div')
			element.style.width = '100%'
			element.style.height = '100%'
			return element
		})(),
	)

	useEffect(() => {
		const containerEl = containerRef.current
		if (portalPosition && containerEl.parentNode !== portalPosition) {
			portalPosition.appendChild(containerEl)
		}

		return () => {
			if (containerEl.parentNode) {
				containerEl.parentNode.removeChild(containerEl)
			}
		}
	}, [portalPosition])

	useEffect(() => {
		SetPortalPosition = (position, props) => {
			setPortalPosition(position)
			setPortalProps(props)
		}
	}, [setPortalPosition])

	const actualProps = portalProps ?? {
		value: '',
		softKey: 'parked',
		onChange: () => {},
	}

	return createPortal(<RichTextEditorWithFallback {...actualProps} />, containerRef.current)
}
