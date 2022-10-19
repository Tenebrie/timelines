import styled from 'styled-components'

export type StoryEventMarkerProps = {
	groupIndex: number
	expanded: boolean
}

export const Marker = styled.div`
	position: relative;
	width: 50px;
	height: 50px;
	border-radius: 50%;
	background: lightgray;
	cursor: pointer;
	border: 1px solid black;
	margin-bottom: -35px;
	transition: margin-bottom 0.3s;

	&.expanded {
		margin-bottom: 0;
	}
`

export const LabelContainer = styled.div`
	position: absolute;
	display: flex;
	align-items: center;
	width: 250px;
	left: calc(100% + 4px);
	top: 0;
	height: 100%;
	z-index: 1;
	pointer-events: none;
`

export const Label = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 8px;
	background: rgba(100, 100, 150, 1);
	border-radius: 8px;
	font-weight: 600;
`
