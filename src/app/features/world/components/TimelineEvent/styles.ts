import styled from 'styled-components'

export type StoryEventMarkerProps = {
	offset: number
}
export const Marker = styled.div.attrs<StoryEventMarkerProps>((props) => ({
	style: {
		left: `${props.offset}px`,
	},
}))<StoryEventMarkerProps>`
	position: absolute;
	width: 48px;
	height: 48px;
	border-radius: 50%;
	background: gray;
	top: 50%;
`
