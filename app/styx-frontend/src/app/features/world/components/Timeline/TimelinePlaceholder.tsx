import { useContainerHeight } from './hooks/useContainerHeight'
import { TimelineContainer, TimelineWrapper } from './styles'

export const TimelinePlaceholder = () => {
	const containerHeight = useContainerHeight()

	return (
		<TimelineWrapper>
			<TimelineContainer $height={containerHeight} />
		</TimelineWrapper>
	)
}
