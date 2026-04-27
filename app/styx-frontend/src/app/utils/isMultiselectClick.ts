import { isMacOS } from '@tiptap/core'

export const isMultiselectEvent = (event: MouseEvent | React.MouseEvent) => {
	return event.shiftKey || (isMacOS() ? event.metaKey : event.ctrlKey)
}

export const isMultiselectAltEvent = (event: MouseEvent | React.MouseEvent) => {
	return isMacOS() ? event.metaKey : event.ctrlKey
}
