export type CalendarDefinition =
	| {
			baseOffset: number
			timelineScalar: number
			engine: 'COUNTUP'
			units: CountupCalendarUnits
	  }
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
export type CountupCalendarUnits = {
	inMillisecond: number
	inSecond: number
	inMinute: number
	inHour: number
	inDay: number
}
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

type RealWorldMonth = {
	name: string
	shortName: string
}
type CustomWorldMonth = {
	name: string
	shortName: string
	days: number
}
