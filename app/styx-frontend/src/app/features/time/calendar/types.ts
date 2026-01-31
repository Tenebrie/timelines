// Change request types for the parent to handle
export type CalendarChangeRequest =
	| { type: 'createUnit'; name: string; shortName: string }
	| { type: 'updateUnit'; unitId: string; name?: string; shortName?: string }
	| { type: 'deleteUnit'; unitId: string }
	| {
			type: 'updateUnitChildren'
			unitId: string
			children: { id: string; label?: string; repeats: number }[]
	  }

export type NewCalendarUnitRelation = {
	childUnitId: string
	label?: string | null
	repeats: number
}
