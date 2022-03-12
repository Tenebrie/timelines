import styled from 'styled-components'

export type StoryEventMarkerProps = {
	offset: number
}
export const StoryEventMarkerOdd = styled.div.attrs<StoryEventMarkerProps>((props) => ({
	style: {
		left: `${props.offset}px`,
	},
}))<StoryEventMarkerProps>`
	width: 3px;
	position: absolute;
	height: 18px;
	background: black;
	top: calc(50% + 2px);
	border-radius: 0 0 3px 3px;
`
export const StoryEventMarkerEven = styled.div.attrs<StoryEventMarkerProps>((props) => ({
	style: {
		left: `${props.offset}px`,
	},
}))<StoryEventMarkerProps>`
	width: 3px;
	position: absolute;
	height: 18px;
	background: black;
	bottom: 50%;
	border-radius: 3px 3px 0 0;
`

export const StoryEventMarkerPointOdd = styled.div`
	position: absolute;
	margin-left: -50%;
	margin-top: -50%;
	bottom: -13px;
	left: -3px;
	border-radius: 100%;
	width: 12px;
	height: 12px;
	background: black;
`

export const StoryEventMarkerPointEven = styled.div`
	position: absolute;
	margin-left: -50%;
	margin-top: -50%;
	top: -13px;
	left: -3px;
	border-radius: 100%;
	width: 12px;
	height: 12px;
	background: black;
`
