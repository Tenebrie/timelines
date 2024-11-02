import styled from 'styled-components'

export const TimelineWrapper = styled.div`
	width: 100%;
	padding-bottom: 32px;
	background: #002552;
`

export const TimelineContainer = styled.div.attrs<{ $height: number }>((props) => ({
	style: {
		height: props.$height + 'px',
	},
}))`
	position: relative;
	width: 100%;
	background: #1c4572;
	user-select: none;
	overflow-x: clip;
	border-bottom: 1px solid #112550;

	@media all and (max-height: 1200px) {
		height: 160px;
	}

	@media all and (max-height: 900px) {
		height: 137px;
	}
`
