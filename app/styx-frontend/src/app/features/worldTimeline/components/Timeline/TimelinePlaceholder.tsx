import { useCustomTheme } from '@/app/hooks/useCustomTheme'

import { TimelineContainer, TimelineWrapper } from './styles'

export const TimelinePlaceholder = () => {
	const theme = useCustomTheme()

	return (
		<TimelineWrapper>
			<TimelineContainer $theme={theme} />
		</TimelineWrapper>
	)
}
