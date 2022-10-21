import { EventWizard } from './components/EventWizard/EventWizard'
import { Outliner } from './components/Outliner/Outliner'
import { Timeline } from './components/Timeline/Timeline'
import { WorldContainer } from './styles'

export const World = () => {
	return (
		<WorldContainer>
			<Outliner />
			<Timeline />
			<EventWizard />
		</WorldContainer>
	)
}
