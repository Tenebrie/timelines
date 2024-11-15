import { screen, waitFor, within } from '@testing-library/react'

import { renderWithProviders } from '@/jest/renderWithProviders'

import { TimestampField } from './TimestampField'

describe('<TimestampField />', () => {
	it('displays the correct timestamp by default', () => {
		renderWithProviders(
			<TimestampField label="Custom Label" timestamp={0} calendar="EARTH" onChange={vi.fn()} />,
		)

		expect((screen.getByLabelText('Custom Label') as HTMLInputElement).value).toEqual(
			'2023, January 1, 00:00',
		)
	})

	it('opens up the time picker on click', async () => {
		const { user } = renderWithProviders(<TimestampField timestamp={0} calendar="EARTH" onChange={vi.fn()} />)

		await user.click(screen.getByTestId('CalendarMonthIcon'))

		expect((screen.getByLabelText('Year') as HTMLInputElement).value).toEqual('2023')
		expect(within(screen.getByLabelText('Month')).getByText('January')).toBeInTheDocument()
		expect((screen.getByLabelText('Day') as HTMLInputElement).value).toEqual('1')
		expect((screen.getByLabelText('Hour') as HTMLInputElement).value).toEqual('0')
		expect((screen.getByLabelText('Minute') as HTMLInputElement).value).toEqual('0')
	})

	it('parses initial time into timestamp field', () => {
		renderWithProviders(
			<TimestampField label="Custom Label" timestamp={157989907} calendar="EARTH" onChange={vi.fn()} />,
		)

		expect((screen.getByLabelText('Custom Label') as HTMLInputElement).value).toEqual('2323, May 24, 05:07')
	})

	it('parses initial timestamp into time picker', async () => {
		const { user } = renderWithProviders(
			<TimestampField timestamp={157989907} calendar="EARTH" onChange={vi.fn()} />,
		)

		await user.click(screen.getByTestId('CalendarMonthIcon'))

		expect((screen.getByLabelText('Year') as HTMLInputElement).value).toEqual('2323')
		expect(within(screen.getByLabelText('Month')).getByText('May')).toBeInTheDocument()
		expect((screen.getByLabelText('Day') as HTMLInputElement).value).toEqual('24')
		expect((screen.getByLabelText('Hour') as HTMLInputElement).value).toEqual('5')
		expect((screen.getByLabelText('Minute') as HTMLInputElement).value).toEqual('7')
	})

	it('updates timestamp on year change', async () => {
		const onChangeSpy = vi.fn()
		const { user } = renderWithProviders(
			<TimestampField timestamp={0} calendar="EARTH" onChange={onChangeSpy} />,
		)

		await user.click(screen.getByTestId('CalendarMonthIcon'))
		await user.type(screen.getByLabelText('Year'), '9', {
			initialSelectionStart: 0,
			initialSelectionEnd: 5,
		})

		expect(onChangeSpy).toHaveBeenCalledWith(-1059261120)
	})

	it('updates timestamp on day change', async () => {
		const onChangeSpy = vi.fn()
		const { user } = renderWithProviders(
			<TimestampField timestamp={0} calendar="EARTH" onChange={onChangeSpy} />,
		)

		await user.click(screen.getByTestId('CalendarMonthIcon'))
		await user.type(screen.getByLabelText('Day'), '9')

		expect(onChangeSpy).toHaveBeenCalledWith(25920)
	})

	it('updates timestamp on hour change', async () => {
		const onChangeSpy = vi.fn()
		const { user } = renderWithProviders(
			<TimestampField timestamp={0} calendar="EARTH" onChange={onChangeSpy} />,
		)

		await user.click(screen.getByTestId('CalendarMonthIcon'))
		await user.type(screen.getByLabelText('Hour'), '9')

		await waitFor(() => expect(onChangeSpy).toHaveBeenCalledWith(540))
	})

	it('updates timestamp on minute change', async () => {
		const onChangeSpy = vi.fn()
		const { user } = renderWithProviders(
			<TimestampField timestamp={0} calendar="EARTH" onChange={onChangeSpy} />,
		)

		await user.click(screen.getByTestId('CalendarMonthIcon'))
		await user.type(screen.getByLabelText('Minute'), '9')

		await waitFor(() => expect(onChangeSpy).toHaveBeenCalledWith(9))
	})
})
