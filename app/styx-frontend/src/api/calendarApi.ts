import { baseApi as api } from './base/baseApi'
export const addTagTypes = ['calendar', 'worldDetails'] as const
const injectedRtkApi = api
	.enhanceEndpoints({
		addTagTypes,
	})
	.injectEndpoints({
		endpoints: (build) => ({
			listCalendars: build.query<ListCalendarsApiResponse, ListCalendarsApiArg>({
				query: () => ({ url: `/api/calendars` }),
				providesTags: ['calendar'],
			}),
			createCalendar: build.mutation<CreateCalendarApiResponse, CreateCalendarApiArg>({
				query: (queryArg) => ({ url: `/api/calendars`, method: 'POST', body: queryArg.body }),
				invalidatesTags: ['calendar'],
			}),
			getCalendar: build.query<GetCalendarApiResponse, GetCalendarApiArg>({
				query: (queryArg) => ({ url: `/api/calendar/${queryArg.calendarId}` }),
				providesTags: ['calendar'],
			}),
			updateCalendar: build.mutation<UpdateCalendarApiResponse, UpdateCalendarApiArg>({
				query: (queryArg) => ({
					url: `/api/calendar/${queryArg.calendarId}`,
					method: 'PATCH',
					body: queryArg.body,
				}),
				invalidatesTags: ['calendar'],
			}),
			deleteCalendar: build.mutation<DeleteCalendarApiResponse, DeleteCalendarApiArg>({
				query: (queryArg) => ({ url: `/api/calendar/${queryArg.calendarId}`, method: 'DELETE' }),
				invalidatesTags: ['calendar'],
			}),
			getCalendarPreview: build.query<GetCalendarPreviewApiResponse, GetCalendarPreviewApiArg>({
				query: (queryArg) => ({ url: `/api/calendar/${queryArg.calendarId}/preview` }),
				providesTags: ['calendar'],
			}),
			createCalendarUnit: build.mutation<CreateCalendarUnitApiResponse, CreateCalendarUnitApiArg>({
				query: (queryArg) => ({
					url: `/api/calendar/${queryArg.calendarId}/units`,
					method: 'POST',
					body: queryArg.body,
				}),
				invalidatesTags: ['calendar'],
			}),
			updateCalendarUnit: build.mutation<UpdateCalendarUnitApiResponse, UpdateCalendarUnitApiArg>({
				query: (queryArg) => ({
					url: `/api/calendar/${queryArg.calendarId}/unit/${queryArg.unitId}`,
					method: 'PATCH',
					body: queryArg.body,
				}),
				invalidatesTags: ['calendar'],
			}),
			deleteCalendarUnit: build.mutation<DeleteCalendarUnitApiResponse, DeleteCalendarUnitApiArg>({
				query: (queryArg) => ({
					url: `/api/calendar/${queryArg.calendarId}/unit/${queryArg.unitId}`,
					method: 'DELETE',
				}),
				invalidatesTags: ['calendar'],
			}),
			createCalendarPresentation: build.mutation<
				CreateCalendarPresentationApiResponse,
				CreateCalendarPresentationApiArg
			>({
				query: (queryArg) => ({
					url: `/api/calendar/${queryArg.calendarId}/presentations`,
					method: 'POST',
					body: queryArg.body,
				}),
				invalidatesTags: ['calendar'],
			}),
			updateCalendarPresentation: build.mutation<
				UpdateCalendarPresentationApiResponse,
				UpdateCalendarPresentationApiArg
			>({
				query: (queryArg) => ({
					url: `/api/calendar/${queryArg.calendarId}/presentation/${queryArg.presentationId}`,
					method: 'PATCH',
					body: queryArg.body,
				}),
				invalidatesTags: ['calendar'],
			}),
			deleteCalendarPresentation: build.mutation<
				DeleteCalendarPresentationApiResponse,
				DeleteCalendarPresentationApiArg
			>({
				query: (queryArg) => ({
					url: `/api/calendar/${queryArg.calendarId}/presentation/${queryArg.presentationId}`,
					method: 'DELETE',
				}),
				invalidatesTags: ['calendar'],
			}),
			listWorldCalendars: build.query<ListWorldCalendarsApiResponse, ListWorldCalendarsApiArg>({
				query: (queryArg) => ({ url: `/api/world/${queryArg.worldId}/calendars` }),
				providesTags: ['calendar', 'worldDetails'],
			}),
		}),
		overrideExisting: false,
	})
export { injectedRtkApi as calendarApi }
export type ListCalendarsApiResponse = /** status 200  */ {
	description: string
	id: string
	createdAt: string
	updatedAt: string
	name: string
	worldId?: null | string
	ownerId?: null | string
	position: number
	originTime: string
	dateFormat?: null | string
}[]
export type ListCalendarsApiArg = void
export type CreateCalendarApiResponse = /** status 200  */ {
	description: string
	id: string
	createdAt: string
	updatedAt: string
	name: string
	worldId?: null | string
	ownerId?: null | string
	position: number
	originTime: string
	dateFormat?: null | string
}
export type CreateCalendarApiArg = {
	body: {
		name: string
		templateId?: string
	}
}
export type GetCalendarApiResponse = /** status 200  */ {
	presentations: {
		units: {
			unit: {
				id: string
				createdAt: string
				updatedAt: string
				name: string
				calendarId: string
				position: number
				displayName?: null | string
				displayNameShort?: null | string
				displayNamePlural?: null | string
				formatMode: 'Name' | 'NameOneIndexed' | 'Numeric' | 'NumericOneIndexed' | 'Hidden'
				formatShorthand?: null | string
				negativeFormat: 'MinusSign' | 'AbsoluteValue'
				duration: string
				treeDepth: number
			}
			id: string
			createdAt: string
			updatedAt: string
			name: string
			unitId: string
			presentationId: string
			formatString: string
			subdivision: number
			labeledIndices: number[]
		}[]
		id: string
		createdAt: string
		updatedAt: string
		name: string
		calendarId: string
		scaleFactor: number
		compression: number
		baselineUnitId?: null | string
	}[]
	units: {
		children: {
			id: string
			createdAt: string
			updatedAt: string
			position: number
			label?: null | string
			shortLabel?: null | string
			repeats: number
			parentUnitId: string
			childUnitId: string
		}[]
		parents: {
			id: string
			createdAt: string
			updatedAt: string
			position: number
			label?: null | string
			shortLabel?: null | string
			repeats: number
			parentUnitId: string
			childUnitId: string
		}[]
		id: string
		createdAt: string
		updatedAt: string
		name: string
		calendarId: string
		position: number
		displayName?: null | string
		displayNameShort?: null | string
		displayNamePlural?: null | string
		formatMode: 'Name' | 'NameOneIndexed' | 'Numeric' | 'NumericOneIndexed' | 'Hidden'
		formatShorthand?: null | string
		negativeFormat: 'MinusSign' | 'AbsoluteValue'
		duration: string
		treeDepth: number
	}[]
	description: string
	id: string
	createdAt: string
	updatedAt: string
	name: string
	worldId?: null | string
	ownerId?: null | string
	position: number
	originTime: string
	dateFormat?: null | string
}
export type GetCalendarApiArg = {
	/** Any string value */
	calendarId: string
}
export type UpdateCalendarApiResponse = /** status 200  */ {
	description: string
	id: string
	createdAt: string
	updatedAt: string
	name: string
	worldId?: null | string
	ownerId?: null | string
	position: number
	originTime: string
	dateFormat?: null | string
}
export type UpdateCalendarApiArg = {
	/** Any string value */
	calendarId: string
	body: {
		name?: string
		originTime?: string
		dateFormat?: null | string
	}
}
export type DeleteCalendarApiResponse = /** status 200  */ {
	description: string
	id: string
	createdAt: string
	updatedAt: string
	name: string
	worldId?: null | string
	ownerId?: null | string
	position: number
	originTime: string
	dateFormat?: null | string
}
export type DeleteCalendarApiArg = {
	/** Any string value */
	calendarId: string
}
export type GetCalendarPreviewApiResponse = /** status 200  */ {
	units: {
		displayName: string
		displayNameShort: string
		displayNamePlural: string
		children: {
			id: string
			createdAt: string
			updatedAt: string
			position: number
			label?: null | string
			shortLabel?: null | string
			repeats: number
			parentUnitId: string
			childUnitId: string
		}[]
		parents: {
			id: string
			createdAt: string
			updatedAt: string
			position: number
			label?: null | string
			shortLabel?: null | string
			repeats: number
			parentUnitId: string
			childUnitId: string
		}[]
		id: string
		createdAt: string
		updatedAt: string
		name: string
		calendarId: string
		position: number
		formatMode: 'Name' | 'NameOneIndexed' | 'Numeric' | 'NumericOneIndexed' | 'Hidden'
		formatShorthand?: null | string
		negativeFormat: 'MinusSign' | 'AbsoluteValue'
		duration: string
		treeDepth: number
	}[]
	presentations: {
		units: {
			unit: {
				id: string
				createdAt: string
				updatedAt: string
				name: string
				calendarId: string
				position: number
				displayName?: null | string
				displayNameShort?: null | string
				displayNamePlural?: null | string
				formatMode: 'Name' | 'NameOneIndexed' | 'Numeric' | 'NumericOneIndexed' | 'Hidden'
				formatShorthand?: null | string
				negativeFormat: 'MinusSign' | 'AbsoluteValue'
				duration: string
				treeDepth: number
			}
			id: string
			createdAt: string
			updatedAt: string
			name: string
			unitId: string
			presentationId: string
			formatString: string
			subdivision: number
			labeledIndices: number[]
		}[]
		id: string
		createdAt: string
		updatedAt: string
		name: string
		calendarId: string
		scaleFactor: number
		compression: number
		baselineUnitId?: null | string
	}[]
	description: string
	id: string
	createdAt: string
	updatedAt: string
	name: string
	worldId?: null | string
	ownerId?: null | string
	position: number
	originTime: string
	dateFormat?: null | string
}
export type GetCalendarPreviewApiArg = {
	/** Any string value */
	calendarId: string
}
export type CreateCalendarUnitApiResponse = /** status 200  */ {
	id: string
	createdAt: string
	updatedAt: string
	name: string
	calendarId: string
	position: number
	displayName?: null | string
	displayNameShort?: null | string
	displayNamePlural?: null | string
	formatMode: 'Name' | 'NameOneIndexed' | 'Numeric' | 'NumericOneIndexed' | 'Hidden'
	formatShorthand?: null | string
	negativeFormat: 'MinusSign' | 'AbsoluteValue'
	duration: string
	treeDepth: number
}
export type CreateCalendarUnitApiArg = {
	/** Any string value */
	calendarId: string
	body: {
		name: string
		displayName?: null | string
		displayNameShort?: null | string
		displayNamePlural?: null | string
		formatMode?: 'Name' | 'NameOneIndexed' | 'Numeric' | 'NumericOneIndexed' | 'Hidden'
		formatShorthand?: null | string
	}
}
export type UpdateCalendarUnitApiResponse = /** status 200  */ {
	children: {
		id: string
		createdAt: string
		updatedAt: string
		position: number
		label?: null | string
		shortLabel?: null | string
		repeats: number
		parentUnitId: string
		childUnitId: string
	}[]
	id: string
	createdAt: string
	updatedAt: string
	name: string
	calendarId: string
	position: number
	displayName?: null | string
	displayNameShort?: null | string
	displayNamePlural?: null | string
	formatMode: 'Name' | 'NameOneIndexed' | 'Numeric' | 'NumericOneIndexed' | 'Hidden'
	formatShorthand?: null | string
	negativeFormat: 'MinusSign' | 'AbsoluteValue'
	duration: string
	treeDepth: number
}
export type UpdateCalendarUnitApiArg = {
	/** Any string value */
	calendarId: string
	/** Any string value */
	unitId: string
	body: {
		name?: string
		displayName?: null | string
		displayNameShort?: null | string
		displayNamePlural?: null | string
		formatMode?: 'Name' | 'NameOneIndexed' | 'Numeric' | 'NumericOneIndexed' | 'Hidden'
		formatShorthand?: null | string
		children?: {
			repeats: number
			childUnitId: string
			label?: null | string
			shortLabel?: null | string
		}[]
		position?: number
	}
}
export type DeleteCalendarUnitApiResponse = /** status 200  */ {
	id: string
	createdAt: string
	updatedAt: string
	name: string
	calendarId: string
	position: number
	displayName?: null | string
	displayNameShort?: null | string
	displayNamePlural?: null | string
	formatMode: 'Name' | 'NameOneIndexed' | 'Numeric' | 'NumericOneIndexed' | 'Hidden'
	formatShorthand?: null | string
	negativeFormat: 'MinusSign' | 'AbsoluteValue'
	duration: string
	treeDepth: number
}
export type DeleteCalendarUnitApiArg = {
	/** Any string value */
	calendarId: string
	/** Any string value */
	unitId: string
}
export type CreateCalendarPresentationApiResponse = /** status 200  */ {
	units: {
		unit: {
			id: string
			createdAt: string
			updatedAt: string
			name: string
			calendarId: string
			position: number
			displayName?: null | string
			displayNameShort?: null | string
			displayNamePlural?: null | string
			formatMode: 'Name' | 'NameOneIndexed' | 'Numeric' | 'NumericOneIndexed' | 'Hidden'
			formatShorthand?: null | string
			negativeFormat: 'MinusSign' | 'AbsoluteValue'
			duration: string
			treeDepth: number
		}
		id: string
		createdAt: string
		updatedAt: string
		name: string
		unitId: string
		presentationId: string
		formatString: string
		subdivision: number
		labeledIndices: number[]
	}[]
	baselineUnit: null | {
		id: string
		createdAt: string
		updatedAt: string
		name: string
		calendarId: string
		position: number
		displayName?: null | string
		displayNameShort?: null | string
		displayNamePlural?: null | string
		formatMode: 'Name' | 'NameOneIndexed' | 'Numeric' | 'NumericOneIndexed' | 'Hidden'
		formatShorthand?: null | string
		negativeFormat: 'MinusSign' | 'AbsoluteValue'
		duration: string
		treeDepth: number
	}
	id: string
	createdAt: string
	updatedAt: string
	name: string
	calendarId: string
	scaleFactor: number
	compression: number
	baselineUnitId?: null | string
}
export type CreateCalendarPresentationApiArg = {
	/** Any string value */
	calendarId: string
	body: {
		name: string
		scaleFactor?: number
	}
}
export type UpdateCalendarPresentationApiResponse = /** status 200  */ {
	units: {
		unit: {
			id: string
			createdAt: string
			updatedAt: string
			name: string
			calendarId: string
			position: number
			displayName?: null | string
			displayNameShort?: null | string
			displayNamePlural?: null | string
			formatMode: 'Name' | 'NameOneIndexed' | 'Numeric' | 'NumericOneIndexed' | 'Hidden'
			formatShorthand?: null | string
			negativeFormat: 'MinusSign' | 'AbsoluteValue'
			duration: string
			treeDepth: number
		}
		id: string
		createdAt: string
		updatedAt: string
		name: string
		unitId: string
		presentationId: string
		formatString: string
		subdivision: number
		labeledIndices: number[]
	}[]
	baselineUnit: null | {
		id: string
		createdAt: string
		updatedAt: string
		name: string
		calendarId: string
		position: number
		displayName?: null | string
		displayNameShort?: null | string
		displayNamePlural?: null | string
		formatMode: 'Name' | 'NameOneIndexed' | 'Numeric' | 'NumericOneIndexed' | 'Hidden'
		formatShorthand?: null | string
		negativeFormat: 'MinusSign' | 'AbsoluteValue'
		duration: string
		treeDepth: number
	}
	id: string
	createdAt: string
	updatedAt: string
	name: string
	calendarId: string
	scaleFactor: number
	compression: number
	baselineUnitId?: null | string
}
export type UpdateCalendarPresentationApiArg = {
	/** Any string value */
	calendarId: string
	/** Any string value */
	presentationId: string
	body: {
		name?: string
		units?: {
			unitId: string
			formatString: string
		}[]
	}
}
export type DeleteCalendarPresentationApiResponse = /** status 200  */ {
	id: string
	createdAt: string
	updatedAt: string
	name: string
	calendarId: string
	scaleFactor: number
	compression: number
	baselineUnitId?: null | string
}
export type DeleteCalendarPresentationApiArg = {
	/** Any string value */
	calendarId: string
	/** Any string value */
	presentationId: string
}
export type ListWorldCalendarsApiResponse = /** status 200  */ {
	description: string
	id: string
	createdAt: string
	updatedAt: string
	name: string
	worldId?: null | string
	ownerId?: null | string
	position: number
	originTime: string
	dateFormat?: null | string
}[]
export type ListWorldCalendarsApiArg = {
	/** Any string value */
	worldId: string
}
export const {
	useListCalendarsQuery,
	useLazyListCalendarsQuery,
	useCreateCalendarMutation,
	useGetCalendarQuery,
	useLazyGetCalendarQuery,
	useUpdateCalendarMutation,
	useDeleteCalendarMutation,
	useGetCalendarPreviewQuery,
	useLazyGetCalendarPreviewQuery,
	useCreateCalendarUnitMutation,
	useUpdateCalendarUnitMutation,
	useDeleteCalendarUnitMutation,
	useCreateCalendarPresentationMutation,
	useUpdateCalendarPresentationMutation,
	useDeleteCalendarPresentationMutation,
	useListWorldCalendarsQuery,
	useLazyListWorldCalendarsQuery,
} = injectedRtkApi
