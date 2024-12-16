import '@testing-library/jest-dom'

import { fireEvent, render, screen } from '@testing-library/react'

import { ColorPicker } from './ColorPicker'

describe('ColorPicker', () => {
	it('renders correctly with initial value', async () => {
		render(<ColorPicker initialValue="hsl(180, 100%, 50%)" />)
		const colorBox = screen.getByTestId('color-preview')
		expect(colorBox).toHaveStyle({ backgroundColor: 'hsl(180, 100%, 50%)' })
	})

	it('changes the value on hue input change', () => {
		render(<ColorPicker initialValue="hsl(180, 100%, 50%)" />)
		const input = screen.getAllByDisplayValue('180').find((el) => el.matches('input[type="number"]'))!
		fireEvent.change(input, { target: { value: 190 } })
		expect(screen.getByDisplayValue('hsl(190, 100%, 50%)')).toBeInTheDocument()
	})

	it('changes the value on saturation input change', () => {
		render(<ColorPicker initialValue="hsl(180, 100%, 50%)" />)
		const input = screen.getAllByDisplayValue('100').find((el) => el.matches('input[type="number"]'))!
		fireEvent.change(input, { target: { value: 75 } })
		expect(screen.getByDisplayValue('hsl(180, 75%, 50%)')).toBeInTheDocument()
	})

	it('changes the value on lightness input change', () => {
		render(<ColorPicker initialValue="hsl(180, 100%, 50%)" />)
		const input = screen.getAllByDisplayValue('50').find((el) => el.matches('input[type="number"]'))!
		fireEvent.change(input, { target: { value: 34 } })
		expect(screen.getByDisplayValue('hsl(180, 100%, 34%)')).toBeInTheDocument()
	})

	it('changes the value on manual HSL input', () => {
		render(<ColorPicker initialValue="hsl(180, 100%, 50%)" />)
		const input = screen.getByDisplayValue('hsl(180, 100%, 50%)')
		fireEvent.change(input, { target: { value: 'hsl(130, 80%, 60%)' } })
		expect(screen.getAllByDisplayValue('130')[0]).toBeInTheDocument()
		expect(screen.getAllByDisplayValue('80')[0]).toBeInTheDocument()
		expect(screen.getAllByDisplayValue('60')[0]).toBeInTheDocument()
	})

	it('changes the value on manual HSL input', () => {
		render(<ColorPicker initialValue="hsl(180, 100%, 50%)" />)
		const input = screen.getByDisplayValue('hsl(180, 100%, 50%)')
		fireEvent.change(input, { target: { value: 'rgb(216, 191, 216)' } })
		expect(screen.getAllByDisplayValue('300')[0]).toBeInTheDocument()
		expect(screen.getAllByDisplayValue('24')[0]).toBeInTheDocument()
		expect(screen.getAllByDisplayValue('80')[0]).toBeInTheDocument()
	})

	it('changes the value on manual hex input', () => {
		render(<ColorPicker initialValue="hsl(180, 100%, 50%)" />)
		const input = screen.getByDisplayValue('hsl(180, 100%, 50%)')
		fireEvent.change(input, { target: { value: '#D8BFD8' } })
		expect(screen.getAllByDisplayValue('300')[0]).toBeInTheDocument()
		expect(screen.getAllByDisplayValue('24')[0]).toBeInTheDocument()
		expect(screen.getAllByDisplayValue('80')[0]).toBeInTheDocument()
	})

	describe('hsl', () => {
		it('does not call onChange unnecessarily', () => {
			const handleChange = vi.fn()
			render(<ColorPicker initialValue="hsl(180, 100%, 50%)" onChangeHsl={handleChange} />)
			expect(handleChange).not.toHaveBeenCalled()
		})

		it('respects changing the hue slider', () => {
			const handleChange = vi.fn()
			render(<ColorPicker initialValue="hsl(180, 100%, 50%)" onChangeHsl={handleChange} />)
			const hueSlider = screen.getAllByRole('slider')[0]
			fireEvent.change(hueSlider, { target: { value: 200 } })
			expect(handleChange).toHaveBeenCalledWith('hsl(200, 100%, 50%)')
			expect(screen.getByDisplayValue('hsl(200, 100%, 50%)')).toBeInTheDocument()
		})

		it('respects changing the saturation slider', () => {
			const handleChange = vi.fn()
			render(<ColorPicker initialValue="hsl(180, 100%, 50%)" onChangeHsl={handleChange} />)
			const hueSlider = screen.getAllByRole('slider')[1]
			fireEvent.change(hueSlider, { target: { value: 25 } })
			expect(handleChange).toHaveBeenCalledWith('hsl(180, 25%, 50%)')
			expect(screen.getByDisplayValue('hsl(180, 25%, 50%)')).toBeInTheDocument()
		})

		it('respects changing the lightness slider', () => {
			const handleChange = vi.fn()
			render(<ColorPicker initialValue="hsl(180, 100%, 50%)" onChangeHsl={handleChange} />)
			const hueSlider = screen.getAllByRole('slider')[2]
			fireEvent.change(hueSlider, { target: { value: 80 } })
			expect(handleChange).toHaveBeenCalledWith('hsl(180, 100%, 80%)')
			expect(screen.getByDisplayValue('hsl(180, 100%, 80%)')).toBeInTheDocument()
		})
	})

	describe('hex', () => {
		it('does not call onChange unnecessarily', () => {
			const handleChange = vi.fn()
			render(<ColorPicker initialValue="hsl(180, 100%, 50%)" onChangeHex={handleChange} />)
			expect(handleChange).not.toHaveBeenCalled()
		})

		it('respects changing the hue slider', () => {
			const handleChange = vi.fn()
			render(<ColorPicker initialValue="hsl(180, 100%, 50%)" onChangeHex={handleChange} />)
			const hueSlider = screen.getAllByRole('slider')[0]
			fireEvent.change(hueSlider, { target: { value: 200 } })
			expect(handleChange).toHaveBeenCalledWith('#00aaff')
			expect(screen.getByDisplayValue('hsl(200, 100%, 50%)')).toBeInTheDocument()
		})

		it('respects changing the saturation slider', () => {
			const handleChange = vi.fn()
			render(<ColorPicker initialValue="hsl(180, 100%, 50%)" onChangeHex={handleChange} />)
			const hueSlider = screen.getAllByRole('slider')[1]
			fireEvent.change(hueSlider, { target: { value: 25 } })
			expect(handleChange).toHaveBeenCalledWith('#609f9f')
			expect(screen.getByDisplayValue('hsl(180, 25%, 50%)')).toBeInTheDocument()
		})

		it('respects changing the lightness slider', () => {
			const handleChange = vi.fn()
			render(<ColorPicker initialValue="hsl(180, 100%, 50%)" onChangeHex={handleChange} />)
			const hueSlider = screen.getAllByRole('slider')[2]
			fireEvent.change(hueSlider, { target: { value: 80 } })
			expect(handleChange).toHaveBeenCalledWith('#99ffff')
			expect(screen.getByDisplayValue('hsl(180, 100%, 80%)')).toBeInTheDocument()
		})
	})

	it('displays the initial color in the input field', () => {
		render(<ColorPicker initialValue="hsl(255, 74%, 49%)" />)
		expect(screen.getByDisplayValue('hsl(255, 74%, 49%)')).toBeInTheDocument()
	})

	it('displays the default color in the input field', () => {
		render(<ColorPicker />)
		expect(screen.getByDisplayValue('hsl(180, 100%, 50%)')).toBeInTheDocument()
	})
})
