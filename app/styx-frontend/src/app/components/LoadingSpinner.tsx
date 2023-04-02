import { useSelector } from 'react-redux'
import styled from 'styled-components'

import { RootState } from '../store'

const Container = styled.div`
	position: relative;
	width: 100%;
	height: 100%;
	max-width: 256px;
	max-height: 256px;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-wrap: wrap;
	overflow: hidden;

	&.huge {
		width: 100%;
		height: 100%;

		& > * {
			width: 25%;
			height: 25%;
		}
	}

	&.wild {
		animation-delay: -0.6s;
		animation-name: preloader;
		animation-duration: 3s;
		animation-iteration-count: infinite;
		animation-timing-function: ease-in-out;
	}
`

const MySvg = styled.svg`
	width: 100%;
	height: 100%;
	@keyframes preloader {
		50% {
			transform: rotate(360deg);
		}
	}

	@keyframes hue1 {
		100% {
			filter: hue-rotate(360deg);
		}
	}

	@keyframes hue2 {
		100% {
			filter: hue-rotate(-360deg);
		}
	}

	circle:nth-of-type(1) {
		animation-delay: -0.15s;
		animation-name: preloader;
		animation-duration: 3s;
		animation-iteration-count: infinite;
		animation-timing-function: ease-in-out;
	}
	circle:nth-of-type(2) {
		animation-delay: -0.3s;
		animation-name: preloader;
		animation-duration: 3s;
		animation-iteration-count: infinite;
		animation-timing-function: ease-in-out;
	}
	circle:nth-of-type(3) {
		animation-delay: -0.45s;
		animation-name: preloader;
		animation-duration: 3s;
		animation-iteration-count: infinite;
		animation-timing-function: ease-in-out;
	}
	circle:nth-of-type(4) {
		animation-delay: -0.6s;
		animation-name: preloader;
		animation-duration: 3s;
		animation-iteration-count: infinite;
		animation-timing-function: ease-in-out;
	}

	&.hue {
		circle:nth-of-type(1) {
			animation-name: preloader, hue1;
		}
		circle:nth-of-type(3) {
			animation-name: preloader, hue2;
		}
	}

	&.wild {
		animation-delay: -0.6s;
		animation-name: preloader;
		animation-duration: 3s;
		animation-iteration-count: infinite;
		animation-timing-function: ease-in-out;
	}
`

export const LoadingSpinner = () => {
	const colorA = '#0a1929'
	const colorB = '#00b3b3'
	const { colors, multiSpinny, extraSpinny } = useSelector((state: RootState) => state.spinny)
	return (
		<Container className={`${multiSpinny ? 'huge' : ''} ${extraSpinny ? 'wild' : ''}`}>
			{!multiSpinny && (
				<MySvg className={colors ? 'hue' : ''} xmlns="http://www.w3.org/2000/svg" viewBox="-85 -85 170 170">
					<circle cx="2.5" cy="2.5" r="40" stroke={colorB} fill={colorB} shapeRendering="optimizeQuality" />
					<circle cx="2.5" cy="2.5" r="34" stroke={colorA} fill={colorA} shapeRendering="optimizeQuality" />
					<circle cx="2.5" cy="2.5" r="28" stroke={colorB} fill={colorB} shapeRendering="optimizeQuality" />
					<circle cx="2.5" cy="2.5" r="21.5" stroke={colorA} fill={colorA} shapeRendering="optimizeQuality" />
				</MySvg>
			)}
			{multiSpinny &&
				[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
					<MySvg
						key={i}
						className={colors ? 'hue' : ''}
						xmlns="http://www.w3.org/2000/svg"
						viewBox="-340 -340 680 680"
					>
						<circle cx="10" cy="10" r="160" stroke={colorB} fill={colorB} />
						<circle cx="10" cy="10" r="135" stroke={colorA} fill={colorA} />
						<circle cx="10" cy="10" r="110" stroke={colorB} fill={colorB} />
						<circle cx="10" cy="10" r="85" stroke={colorA} fill={colorA} />
					</MySvg>
				))}
		</Container>
	)
}
