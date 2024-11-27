export type CalendarDefinition =
	| {
			baseOffset: number
			timelineScalar: number
			engine: 'SIMPLE'
			units: SimpleCalendarUnits
	  }
	| {
			baseOffset: number
			timelineScalar: number
			engine: 'JS_DATE'
			months: TwelveRealMonths
	  }

type TwelveRealMonths = [
	RealWorldMonth,
	RealWorldMonth,
	RealWorldMonth,
	RealWorldMonth,
	RealWorldMonth,
	RealWorldMonth,
	RealWorldMonth,
	RealWorldMonth,
	RealWorldMonth,
	RealWorldMonth,
	RealWorldMonth,
	RealWorldMonth,
]
export type TwelveCustomMonths = [
	CustomWorldMonth,
	CustomWorldMonth,
	CustomWorldMonth,
	CustomWorldMonth,
	CustomWorldMonth,
	CustomWorldMonth,
	CustomWorldMonth,
	CustomWorldMonth,
	CustomWorldMonth,
	CustomWorldMonth,
	CustomWorldMonth,
	CustomWorldMonth,
]
export type SimpleCalendarUnits = {
	inMillisecond: number
	inSecond: number
	inMinute: number
	inHour: number
	inDay: number
	months: {
		name: string
		shortName: string
		days: number
	}[]
}

export type RealWorldMonth = {
	name: string
	shortName: string
	days: number
}
export type CustomWorldMonth = {
	name: string
	shortName: string
	days: number
}
