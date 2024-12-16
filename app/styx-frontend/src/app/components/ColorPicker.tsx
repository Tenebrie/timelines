import { OutlinedInput, Slider, Stack } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'

import { darkTheme, lightTheme } from '../features/theming/themes'
import { colorStringToHsl, hslToHex } from '../utils/getContrastTextColor'
import { ColoredChip } from './ColoredChip'

type Props = {
	initialValue?: string
	onChangeHex?: (value: string) => void
	onChangeHsl?: (value: string) => void
}

export const ColorPicker = ({ initialValue, onChangeHex, onChangeHsl }: Props) => {
	const parsedValue = colorStringToHsl(initialValue ?? 'hsl(180, 100%, 50%)')

	const [hue, setHue] = useState(parsedValue.h * 360)
	const [saturation, setSaturation] = useState(parsedValue.s * 100)
	const [lightness, setLightness] = useState(parsedValue.l * 100)

	const calculatedHue = useMemo(() => Math.round(hue), [hue])
	const color = useMemo(
		() => `hsl(${calculatedHue}, ${saturation}%, ${lightness}%)`,
		[calculatedHue, lightness, saturation],
	)

	useEffect(() => {
		const hexValue = hslToHex(hue / 360, saturation / 100, lightness / 100)
		if (hexValue === initialValue || color === initialValue) {
			return
		}

		onChangeHex?.(hexValue)
		onChangeHsl?.(color)
	}, [calculatedHue, color, lightness, onChangeHex, onChangeHsl, saturation, hue, initialValue])

	const hueShowColor = `hsl(${calculatedHue}, ${100}%, ${50}%)`
	const saturationShowColor = `hsl(${calculatedHue}, ${saturation}%, ${50}%)`

	return (
		<Stack direction="row" gap={4}>
			<Stack direction="column" justifyContent="space-between" gap={1}>
				<Stack direction="row" sx={{ width: '100%', height: '100%' }} gap={1}>
					<div
						data-testid="color-preview"
						style={{
							backgroundColor: color,
							width: '50%',
							height: '100%',
							borderRadius: '4px',
						}}
					></div>
					<Stack direction="column" sx={{ width: '50%', height: '100%' }} gap={1}>
						<div
							style={{
								backgroundColor: lightTheme.palette.background.paper,
								width: '100%',
								height: '100%',
								borderRadius: '4px',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
							}}
						>
							<ColoredChip text="Name" color={color} />
						</div>
						<div
							style={{
								backgroundColor: darkTheme.palette.background.paper,
								width: '100%',
								height: '100%',
								borderRadius: '4px',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
							}}
						>
							<ColoredChip text="Name" color={color} />
						</div>
					</Stack>
				</Stack>
				{/* <ColoredChip text="Name" color={color} /> */}
				<OutlinedInput size="small" sx={{ width: '192px' }} value={color} />
			</Stack>
			<Stack direction="column" width="100%" gap={1}>
				<Stack direction="row" gap={4} sx={{ alignItems: 'center' }}>
					<HueSlider
						name="hue"
						step={1}
						max={360}
						$color={hueShowColor}
						value={hue}
						onChange={(_, value) => setHue(value as number)}
					/>
					<OutlinedInput size="small" sx={{ width: '110px' }} type="number" value={calculatedHue} />
				</Stack>
				<Stack direction="row" gap={4} sx={{ alignItems: 'center' }}>
					<BaseSlider
						name="saturation"
						step={1}
						$color={saturationShowColor}
						value={saturation}
						onChange={(_, value) => setSaturation(value as number)}
						sx={{
							'.MuiSlider-rail': {
								background: `linear-gradient(90deg, hsl(${calculatedHue}, 0%, 50%) 0%, hsl(${calculatedHue}, 100%, 50%) 100%);`,
							},
						}}
					/>
					<OutlinedInput size="small" sx={{ width: '110px' }} type="number" value={saturation} />
				</Stack>
				<Stack direction="row" gap={4} sx={{ alignItems: 'center' }}>
					<BaseSlider
						name="lightness"
						step={1}
						$color={color}
						value={lightness}
						onChange={(_, value) => setLightness(value as number)}
						sx={{
							'.MuiSlider-rail': {
								background: `
									linear-gradient(90deg,
										hsl(${calculatedHue}, ${saturation}%, 0%) 0%,
										hsl(${calculatedHue}, ${saturation}%, 50%) 50%,
										hsl(${calculatedHue}, ${saturation}%, 100%) 100%);`,
							},
						}}
					/>
					<OutlinedInput size="small" sx={{ width: '110px' }} type="number" value={lightness} />
				</Stack>
			</Stack>
		</Stack>
	)
}

const BaseSlider = styled(Slider).attrs<{ $color: string }>((props) => ({
	style: {
		color: props.$color,
	},
}))`
	height: 64px;

	.MuiSlider-rail {
		opacity: 1;
		height: 12px;
	}

	.MuiSlider-track {
		display: none;
	}
`

const HueSlider = styled(BaseSlider)`
	.MuiSlider-rail {
		background: linear-gradient(
			90deg,
			rgba(255, 0, 0, 1) 0%,
			rgba(255, 255, 0, 1) 17%,
			rgba(0, 255, 0, 1) 33%,
			rgba(0, 255, 255, 1) 50%,
			rgba(0, 0, 255, 1) 67%,
			rgba(255, 0, 255, 1) 83%,
			rgba(255, 0, 0, 1) 100%
		);
	}
`
