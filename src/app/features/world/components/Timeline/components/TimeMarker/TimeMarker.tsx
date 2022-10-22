import { Container } from './styles'

type Props = {
	timestamp: number
	scroll: number
	timePerPixel: number
	mode: 'mouse' | 'outliner'
}

export const TimeMarker = ({ timestamp, scroll, timePerPixel, mode }: Props) => {
	const offset = Math.round(timestamp / timePerPixel) + scroll
	return <Container offset={offset} />
}
