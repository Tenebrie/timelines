import { CalendarUnitDisplayFormat } from '@prisma/client'
import { UserAuthenticator } from '@src/middleware/auth/UserAuthenticator.js'
import { SessionMiddleware } from '@src/middleware/SessionMiddleware.js'
import { AuthorizationService } from '@src/services/AuthorizationService.js'
import { CalendarService } from '@src/services/CalendarService.js'
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
import { CalendarUnitChildValidator } from './validators/CalendarUnitChildValidator.js'
import { NameStringValidator } from './validators/NameStringValidator.js'
import { NullableNameStringValidator } from './validators/NullableNameStringValidator.js'

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

	const { name, worldId } = useRequestBody(ctx, {
		name: RequiredParam(NameStringValidator),
		worldId: OptionalParam(StringValidator),
	})

	if (worldId) {
		await AuthorizationService.checkUserWriteAccessById(ctx.user, worldId)
	}

	const { calendar, world } = await CalendarService.createCalendar({
		params: {
			ownerId: ctx.user.id,
			name,
			worldId,
			position: 0,
		},
	})

	if (world && calendar.worldId) {
		RedisService.notifyAboutWorldUpdate(ctx, { worldId: calendar.worldId, timestamp: world.updatedAt })
	}

	return calendar
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

	const { name, dateFormat } = useRequestBody(ctx, {
		name: OptionalParam(NameStringValidator),
		dateFormat: OptionalParam(NullableStringValidator),
	})

	await AuthorizationService.checkUserCalendarWriteAccessById(ctx.user, calendarId)

	const { calendar } = await CalendarService.updateCalendar({
		calendarId,
		params: {
			name,
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
		displayName: OptionalParam(NameStringValidator),
		displayNameShort: OptionalParam(NameStringValidator),
		displayNamePlural: OptionalParam(NameStringValidator),
	})

	const unitCount = await CalendarService.getCalendarUnitCount({ calendarId })

	const { unit } = await CalendarService.createCalendarUnit({
		calendarId,
		params: {
			name: params.name,
			displayName: params.displayName,
			displayNameShort: params.displayNameShort,
			displayNamePlural: params.displayNamePlural,
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
		displayName: OptionalParam(NullableNameStringValidator),
		displayNameShort: OptionalParam(NullableNameStringValidator),
		displayNamePlural: OptionalParam(NullableNameStringValidator),
		dateFormatShorthand: OptionalParam(NullableStringValidator),
		// TODO: Validate enum properly
		displayFormat: OptionalParam(StringValidator),
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
			dateFormatShorthand: params.dateFormatShorthand,
			displayFormat: params.displayFormat as CalendarUnitDisplayFormat,
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

export const CalendarRouter = router
