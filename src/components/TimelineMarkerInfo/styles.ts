import styled from 'styled-components'

export const StoryEventMarkerInfoContainer = styled.div`
	position: absolute;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 250px;
	margin-left: -125px;
`

export const StoryEventMarkerInfoContainerOdd = styled(StoryEventMarkerInfoContainer)`
	top: 32px;
`

export const StoryEventMarkerInfoContainerEven = styled(StoryEventMarkerInfoContainer)`
	bottom: 36px;
`

export const StoryEventMarkerInfoText = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 8px;
	background: rgba(100, 100, 150, 1);
	border-radius: 8px;
	font-weight: 600;
	user-select: none;
	cursor: pointer;
`
