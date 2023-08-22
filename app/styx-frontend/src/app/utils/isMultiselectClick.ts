import { MouseEvent } from 'react'

import { isMacOS } from './isMacOS'

export const isMultiselectClick = (event: MouseEvent) => {
	return isMacOS() ? event.metaKey : event.ctrlKey
}
