import { isMacOS } from '@tiptap/core'
import { MouseEvent } from 'react'

export const isMultiselectClick = (event: MouseEvent) => {
	return isMacOS() ? event.metaKey : event.ctrlKey
}
