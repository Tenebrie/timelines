import { UserAuthenticator } from '@src/middleware/auth/UserAuthenticator.js'
import { SessionMiddleware } from '@src/middleware/SessionMiddleware.js'
import { AuthorizationService } from '@src/services/AuthorizationService.js'
import { CalendarService } from '@src/services/CalendarService.js'
import { CalendarTemplateIdShape, CalendarTemplateService } from '@src/services/CalendarTemplateService.js'
import { RedisService } from '@src/services/RedisService.js'
import {
	NullableStringValidator,
	NumberValidator,
	OptionalParam,
	PathParam,
	RequiredParam,
	Router,
	StringValidator,
	useApiEndpoint,
	useAuth,
	usePathParams,
	useRequestBody,
} from 'moonflower'

import { calendarTag } from './utils/tags.js'
import { CalendarPresentationUnitValidator } from './validators/CalendarPresentationUnitValidator.js'
import { CalendarUnitChildValidator } from './validators/CalendarUnitChildValidator.js'
import { CalendarUnitFormatModeValidator } from './validators/CalendarUnitDisplayFormatValidator.js'
import { NameStringValidator } from './validators/NameStringValidator.js'
import { NullableNameStringWithoutTrimValidator } from './validators/NullableNameStringWithoutTrimValidator.js'
import { TimestampValidator } from './validators/TimestampValidator.js'

const router = new Router().with(SessionMiddleware).with(async (ctx) => {
	const user = await useAuth(ctx, UserAuthenticator)
	return {
		user,
	}
})

router.get('/api/calendars', async (ctx) => {
	useApiEndpoint({
		name: 'listCalendars',
		description: 'Lists all calendars accessible for the current user.',
		tags: [calendarTag],
	})

	return await CalendarService.listUserCalendars({ ownerId: ctx.user.id })
})

router.get('/api/calendar/:calendarId', async (ctx) => {
	useApiEndpoint({
		name: 'getCalendar',
		description: 'Gets the target calendar',
		tags: [calendarTag],
	})

	const { calendarId } = usePathParams(ctx, {
		calendarId: PathParam(StringValidator),
	})

	await AuthorizationService.checkUserCalendarReadAccessById(ctx.user, calendarId)
	const calendar = await CalendarService.getEditorCalendar({ calendarId })

	return calendar
})

router.get('/api/calendar/:calendarId/preview', async (ctx) => {
	useApiEndpoint({
		name: 'getCalendarPreview',
		description: 'Gets the target calendar as it would be sent with the world data',
		tags: [calendarTag],
	})

	const { calendarId } = usePathParams(ctx, {
		calendarId: PathParam(StringValidator),
	})

	await AuthorizationService.checkUserCalendarReadAccessById(ctx.user, calendarId)
	const calendar = await CalendarService.getWorldCalendar({ calendarId })

	return calendar
})

router.post('/api/calendars', async (ctx) => {
	useApiEndpoint({
		name: 'createCalendar',
		description: 'Creates a new world calendar.',
		tags: [calendarTag],
	})

	const { name, templateId } = useRequestBody(ctx, {
		name: RequiredParam(NameStringValidator),
		templateId: OptionalParam(StringValidator),
	})

	const builtInTemplateId = CalendarTemplateIdShape.safeParse(templateId)
	if (templateId && builtInTemplateId.success) {
		const { calendar } = await CalendarTemplateService.createTemplateCalendarStandalone({
			ownerId: ctx.user.id,
			name,
			templateId: builtInTemplateId.data,
		})

		return calendar
	} else if (templateId) {
		const { calendar } = await CalendarService.cloneCalendar({
			calendarId: templateId,
			name,
			ownerId: ctx.user.id,
		})

		return calendar
	} else {
		const { calendar } = await CalendarService.createCalendar({
			params: {
				ownerId: ctx.user.id,
				name,
				position: 0,
			},
		})

		return calendar
	}
})

router.patch('/api/calendar/:calendarId', async (ctx) => {
	useApiEndpoint({
		name: 'updateCalendar',
		description: 'Updates the target calendar',
		tags: [calendarTag],
	})

	const { calendarId } = usePathParams(ctx, {
		calendarId: PathParam(StringValidator),
	})

	const { name, dateFormat, originTime } = useRequestBody(ctx, {
		name: OptionalParam(NameStringValidator),
		originTime: OptionalParam(TimestampValidator),
		dateFormat: OptionalParam(NullableStringValidator),
	})

	await AuthorizationService.checkUserCalendarWriteAccessById(ctx.user, calendarId)

	const { calendar } = await CalendarService.updateCalendar({
		calendarId,
		params: {
			name,
			originTime,
			dateFormat,
		},
	})

	if (calendar.worldId) {
		RedisService.notifyAboutCalendarUpdate(ctx, { worldId: calendar.worldId, calendar })
	}

	return calendar
})

router.post('/api/calendar/:calendarId/units', async (ctx) => {
	useApiEndpoint({
		name: 'createCalendarUnit',
		description: 'Creates a new calendar unit',
		tags: [calendarTag],
	})

	const { calendarId } = usePathParams(ctx, {
		calendarId: PathParam(StringValidator),
	})

	await AuthorizationService.checkUserCalendarWriteAccessById(ctx.user, calendarId)

	const params = useRequestBody(ctx, {
		name: RequiredParam(NameStringValidator),
		displayName: OptionalParam(NullableNameStringWithoutTrimValidator),
		displayNameShort: OptionalParam(NullableNameStringWithoutTrimValidator),
		displayNamePlural: OptionalParam(NullableNameStringWithoutTrimValidator),
		formatMode: OptionalParam(CalendarUnitFormatModeValidator),
		formatShorthand: OptionalParam(NullableStringValidator),
	})

	const unitCount = await CalendarService.getCalendarUnitCount({ calendarId })

	const { unit } = await CalendarService.createCalendarUnit({
		calendarId,
		params: {
			name: params.name,
			displayName: params.displayName,
			displayNameShort: params.displayNameShort,
			displayNamePlural: params.displayNamePlural,
			formatMode: params.formatMode,
			formatShorthand: params.formatShorthand,
			position: unitCount + 1,
		},
	})

	const calendar = await CalendarService.getEditorCalendar({ calendarId })

	if (calendar.worldId) {
		RedisService.notifyAboutCalendarUpdate(ctx, { worldId: calendar.worldId, calendar })
	}

	return unit
})

router.patch('/api/calendar/:calendarId/unit/:unitId', async (ctx) => {
	useApiEndpoint({
		name: 'updateCalendarUnit',
		description: 'Updates the target calendar unit',
		tags: [calendarTag],
	})

	const { calendarId, unitId } = usePathParams(ctx, {
		calendarId: PathParam(StringValidator),
		unitId: PathParam(StringValidator),
	})

	await AuthorizationService.checkUserCalendarWriteAccessById(ctx.user, calendarId)

	const params = useRequestBody(ctx, {
		name: OptionalParam(NameStringValidator),
		displayName: OptionalParam(NullableNameStringWithoutTrimValidator),
		displayNameShort: OptionalParam(NullableNameStringWithoutTrimValidator),
		displayNamePlural: OptionalParam(NullableNameStringWithoutTrimValidator),
		formatMode: OptionalParam(CalendarUnitFormatModeValidator),
		formatShorthand: OptionalParam(NullableStringValidator),
		children: OptionalParam(CalendarUnitChildValidator),
		position: OptionalParam(NumberValidator),
	})

	const { unit } = await CalendarService.updateCalendarUnit({
		calendarId,
		unitId,
		params: {
			name: params.name,
			displayName: params.displayName,
			displayNameShort: params.displayNameShort,
			displayNamePlural: params.displayNamePlural,
			formatMode: params.formatMode,
			formatShorthand: params.formatShorthand,
			children: params.children,
			position: params.position,
		},
	})

	const calendar = await CalendarService.getEditorCalendar({ calendarId })
	if (calendar.worldId) {
		RedisService.notifyAboutCalendarUpdate(ctx, { worldId: calendar.worldId, calendar })
	}

	return unit
})

router.delete('/api/calendar/:calendarId', async (ctx) => {
	useApiEndpoint({
		name: 'deleteCalendar',
		description: 'Deletes the target calendar',
		tags: [calendarTag],
	})

	const { calendarId } = usePathParams(ctx, {
		calendarId: PathParam(StringValidator),
	})

	await AuthorizationService.checkUserCalendarWriteAccessById(ctx.user, calendarId)

	const calendar = await CalendarService.deleteCalendar({ calendarId })

	if (calendar.worldId) {
		RedisService.notifyAboutWorldUpdate(ctx, { worldId: calendar.worldId, timestamp: calendar.updatedAt })
	}

	return calendar
})

router.delete('/api/calendar/:calendarId/unit/:unitId', async (ctx) => {
	useApiEndpoint({
		name: 'deleteCalendarUnit',
		description: 'Deletes the target calendar unit',
		tags: [calendarTag],
	})

	const { calendarId, unitId } = usePathParams(ctx, {
		calendarId: PathParam(StringValidator),
		unitId: PathParam(StringValidator),
	})

	await AuthorizationService.checkUserCalendarWriteAccessById(ctx.user, calendarId)

	const { unit } = await CalendarService.deleteCalendarUnit({ calendarId, unitId })

	const calendar = await CalendarService.getEditorCalendar({ calendarId })

	if (calendar.worldId) {
		RedisService.notifyAboutCalendarUpdate(ctx, { worldId: calendar.worldId, calendar })
	}
	return unit
})

/**
 * Calendar Presentations
 */
router.post('/api/calendar/:calendarId/presentations', async (ctx) => {
	useApiEndpoint({
		name: 'createCalendarPresentation',
		description: 'Creates a new calendar presentation',
		tags: [calendarTag],
	})

	const { calendarId } = usePathParams(ctx, {
		calendarId: PathParam(StringValidator),
	})

	const { name, scaleFactor } = useRequestBody(ctx, {
		name: RequiredParam(NameStringValidator),
		scaleFactor: OptionalParam(NumberValidator),
	})

	await AuthorizationService.checkUserCalendarWriteAccessById(ctx.user, calendarId)

	const { presentation } = await CalendarService.createCalendarPresentation({
		calendarId,
		params: { name, scaleFactor },
	})

	const calendar = await CalendarService.getEditorCalendar({ calendarId })

	if (calendar.worldId) {
		RedisService.notifyAboutCalendarUpdate(ctx, { worldId: calendar.worldId, calendar })
	}

	return presentation
})

router.patch('/api/calendar/:calendarId/presentation/:presentationId', async (ctx) => {
	useApiEndpoint({
		name: 'updateCalendarPresentation',
		description: 'Updates the target calendar presentation',
		tags: [calendarTag],
	})

	const { calendarId, presentationId } = usePathParams(ctx, {
		calendarId: PathParam(StringValidator),
		presentationId: PathParam(StringValidator),
	})

	const { name, units } = useRequestBody(ctx, {
		name: OptionalParam(NameStringValidator),
		units: OptionalParam(CalendarPresentationUnitValidator),
	})

	await AuthorizationService.checkUserCalendarWriteAccessById(ctx.user, calendarId)

	const { presentation } = await CalendarService.updateCalendarPresentation({
		calendarId,
		presentationId,
		params: { name, units },
	})

	const calendar = await CalendarService.getEditorCalendar({ calendarId })

	if (calendar.worldId) {
		RedisService.notifyAboutCalendarUpdate(ctx, { worldId: calendar.worldId, calendar })
	}

	return presentation
})

router.delete('/api/calendar/:calendarId/presentation/:presentationId', async (ctx) => {
	useApiEndpoint({
		name: 'deleteCalendarPresentation',
		description: 'Deletes the target calendar presentation',
		tags: [calendarTag],
	})

	const { calendarId, presentationId } = usePathParams(ctx, {
		calendarId: PathParam(StringValidator),
		presentationId: PathParam(StringValidator),
	})

	await AuthorizationService.checkUserCalendarWriteAccessById(ctx.user, calendarId)

	const { presentation } = await CalendarService.deleteCalendarPresentation({
		calendarId,
		presentationId,
	})

	const calendar = await CalendarService.getEditorCalendar({ calendarId })

	if (calendar.worldId) {
		RedisService.notifyAboutCalendarUpdate(ctx, { worldId: calendar.worldId, calendar })
	}

	return presentation
})

export const CalendarRouter = router
