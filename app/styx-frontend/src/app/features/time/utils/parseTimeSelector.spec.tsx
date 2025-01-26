import { parseTimeSelector } from './parseTimeSelector'

const baseTimeDelta: ReturnType<typeof parseTimeSelector> = {
	toYear: null,
	toMonth: null,
	toDay: null,
	toHour: null,
	toMinute: null,
	deltaYears: 0,
	deltaMonths: 0,
	deltaWeeks: 0,
	deltaDays: 0,
	deltaHours: 0,
	deltaMinutes: 0,
}

/**
 * Some docs for you, copilot:
 * 			<Table
				size="small"
				sx={{ marginTop: theme.material.spacing(1), marginBottom: theme.material.spacing(2) }}
			>
				<TableHead>
					<TableRow>
						<TableCell>Absolute time</TableCell>
						<TableCell> </TableCell>
						<TableCell>Relative time</TableCell>
						<TableCell> </TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					<TableRow>
						<TableCell>Specific date</TableCell>
						<TableCell>
							<CodeButton>2030-06-20</CodeButton>
						</TableCell>
						<TableCell></TableCell>
						<TableCell></TableCell>
					</TableRow>
					<TableRow>
						<TableCell>Specific time</TableCell>
						<TableCell>
							<CodeButton>14:23</CodeButton>
						</TableCell>
						<TableCell></TableCell>
						<TableCell></TableCell>
					</TableRow>
					<TableRow>
						<TableCell>Set to xx:15</TableCell>
						<TableCell>
							<CodeButton>xx:15</CodeButton>
							<CodeButton>m15</CodeButton>
						</TableCell>
						<TableCell>15 minutes forward:</TableCell>
						<TableCell>
							<CodeButton>15m</CodeButton>
						</TableCell>
					</TableRow>
					<TableRow>
						<TableCell>Set to 06:xx</TableCell>
						<TableCell>
							<CodeButton>06:xx</CodeButton>
							<CodeButton>h6</CodeButton>
						</TableCell>
						<TableCell>6 hours forward:</TableCell>
						<TableCell>
							<CodeButton>6h</CodeButton>
						</TableCell>
					</TableRow>
					<TableRow>
						<TableCell>Day 3 of the current month:</TableCell>
						<TableCell>
							<CodeButton>d3</CodeButton>
						</TableCell>
						<TableCell>3 days forward:</TableCell>
						<TableCell>
							<CodeButton>3d</CodeButton>
						</TableCell>
					</TableRow>
					<TableRow>
						<TableCell></TableCell>
						<TableCell></TableCell>
						<TableCell>1 week forward:</TableCell>
						<TableCell>
							<CodeButton>1w</CodeButton>
						</TableCell>
					</TableRow>
					<TableRow>
						<TableCell>March of the current year:</TableCell>
						<TableCell>
							<CodeButton>M3</CodeButton>
						</TableCell>
						<TableCell>3 months forward:</TableCell>
						<TableCell>
							<CodeButton>3M</CodeButton>
						</TableCell>
					</TableRow>
					<TableRow>
						<TableCell>Year 2000:</TableCell>
						<TableCell>
							<CodeButton>y2000</CodeButton>
						</TableCell>
						<TableCell>1 year forward:</TableCell>
						<TableCell>
							<CodeButton>1y</CodeButton>
						</TableCell>
					</TableRow>
					<TableRow>
						<TableCell></TableCell>
						<TableCell></TableCell>
						<TableCell>10 years back:</TableCell>
						<TableCell>
							<CodeButton>-10y</CodeButton>
						</TableCell>
					</TableRow>
					<TableRow>
						<TableCell>00:00 on 2000-01-01:</TableCell>
						<TableCell>
							<CodeButton>y2000!</CodeButton>
						</TableCell>
						<TableCell></TableCell>
						<TableCell></TableCell>
					</TableRow>
					<TableRow>
						<TableCell colSpan={2}>
							Exclamation mark after the selector sets time <i>exactly</i>.
						</TableCell>
						<TableCell></TableCell>
						<TableCell></TableCell>
					</TableRow>
				</TableBody>
			</Table>
		</Typography>
 */

describe('parseTimeSelector', () => {
	it('parses empty string', () => {
		expect(parseTimeSelector('')).toEqual({
			...baseTimeDelta,
		})
	})

	describe('absolute time', () => {
		it('parses absolute years', () => {
			expect(parseTimeSelector('y2030')).toEqual({
				...baseTimeDelta,
				toYear: 2030,
			})
		})

		it('parses absolute months', () => {
			expect(parseTimeSelector('M3')).toEqual({
				...baseTimeDelta,
				toMonth: 2,
			})
		})

		it('parses absolute days', () => {
			expect(parseTimeSelector('d3')).toEqual({
				...baseTimeDelta,
				toDay: 2,
			})
		})

		it('parses absolute hours', () => {
			expect(parseTimeSelector('h3')).toEqual({
				...baseTimeDelta,
				toHour: 3,
			})
		})

		it('parses absolute minutes', () => {
			expect(parseTimeSelector('m3')).toEqual({
				...baseTimeDelta,
				toMinute: 3,
			})
		})

		it('parses absolute date', () => {
			expect(parseTimeSelector('2030-06-20')).toEqual({
				...baseTimeDelta,
				toYear: 2030,
				toMonth: 5,
				toDay: 19,
			})
		})

		it('parses absolute time', () => {
			expect(parseTimeSelector('14:23')).toEqual({
				...baseTimeDelta,
				toHour: 14,
				toMinute: 23,
			})
		})

		it('parses exact time', () => {
			expect(parseTimeSelector('y2000!')).toEqual({
				...baseTimeDelta,
				toYear: 2000,
				toMonth: 0,
				toDay: 0,
				toHour: 0,
				toMinute: 0,
			})
		})

		it('allows combining datetime', () => {
			expect(parseTimeSelector('2030-06-20 14:23')).toEqual({
				...baseTimeDelta,
				toYear: 2030,
				toMonth: 5,
				toDay: 19,
				toHour: 14,
				toMinute: 23,
			})
		})

		it('allows combining complex selectors', () => {
			expect(parseTimeSelector('y2000 M3 d3 h3 m3')).toEqual({
				...baseTimeDelta,
				toYear: 2000,
				toMonth: 2,
				toDay: 2,
				toHour: 3,
				toMinute: 3,
			})
		})
	})

	describe('relative time', () => {
		it('parses relative years', () => {
			expect(parseTimeSelector('3y')).toEqual({
				...baseTimeDelta,
				deltaYears: 3,
			})
		})

		it('parses relative months', () => {
			expect(parseTimeSelector('3M')).toEqual({
				...baseTimeDelta,
				deltaMonths: 3,
			})
		})

		it('parses relative weeks', () => {
			expect(parseTimeSelector('3w')).toEqual({
				...baseTimeDelta,
				deltaWeeks: 3,
			})
		})

		it('parses relative days', () => {
			expect(parseTimeSelector('3d')).toEqual({
				...baseTimeDelta,
				deltaDays: 3,
			})
		})

		it('parses relative hours', () => {
			expect(parseTimeSelector('3h')).toEqual({
				...baseTimeDelta,
				deltaHours: 3,
			})
		})

		it('parses relative minutes', () => {
			expect(parseTimeSelector('3m')).toEqual({
				...baseTimeDelta,
				deltaMinutes: 3,
			})
		})
	})
})
