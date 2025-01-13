import { useCustomTheme } from '@/hooks/useCustomTheme'

import { useContainerHeight } from './hooks/useContainerHeight'
import { TimelineContainer, TimelineWrapper } from './styles'

export const TimelinePlaceholder = () => {
	const theme = useCustomTheme()
	const containerHeight = useContainerHeight()

	return (
		<TimelineWrapper>
			<TimelineContainer $theme={theme} $height={containerHeight} />
		</TimelineWrapper>
	)
}
