import { UserAuthenticator } from '@src/middleware/auth/UserAuthenticator.js'
import { SessionMiddleware } from '@src/middleware/SessionMiddleware.js'
import { AuthorizationService } from '@src/services/AuthorizationService.js'
import { CalendarPresentationService } from '@src/services/CalendarPresentationService.js'
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
import { NameStringValidator } from './validators/NameStringValidator.js'
import { NumberArrayValidator } from './validators/NumberArrayValidator.js'

const router = new Router().with(SessionMiddleware).with(async (ctx) => {
	const user = await useAuth(ctx, UserAuthenticator)
	return {
		user,
	}
})

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

	const { presentation } = await CalendarPresentationService.createCalendarPresentation({
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

	const { name, compression, baselineUnitId } = useRequestBody(ctx, {
		name: OptionalParam(NameStringValidator),
		compression: OptionalParam(NumberValidator),
		baselineUnitId: OptionalParam(NullableStringValidator),
	})

	await AuthorizationService.checkUserCalendarWriteAccessById(ctx.user, calendarId)

	const { presentation } = await CalendarPresentationService.updateCalendarPresentation({
		calendarId,
		presentationId,
		params: { name, compression, baselineUnitId },
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

	const { presentation } = await CalendarPresentationService.deleteCalendarPresentation({
		calendarId,
		presentationId,
	})

	const calendar = await CalendarService.getEditorCalendar({ calendarId })

	if (calendar.worldId) {
		RedisService.notifyAboutCalendarUpdate(ctx, { worldId: calendar.worldId, calendar })
	}

	return presentation
})

/**
 * Calendar Presentations Units
 */
router.post('/api/calendar/:calendarId/presentation/:presentationId/units', async (ctx) => {
	useApiEndpoint({
		name: 'createCalendarPresentationUnit',
		description: 'Adds a new unit to the target calendar presentation',
		tags: [calendarTag],
	})

	const { calendarId, presentationId } = usePathParams(ctx, {
		calendarId: PathParam(StringValidator),
		presentationId: PathParam(StringValidator),
	})

	const { unitId, formatString, subdivision, labeledIndices } = useRequestBody(ctx, {
		unitId: RequiredParam(StringValidator),
		formatString: OptionalParam(StringValidator),
		subdivision: OptionalParam(NumberValidator),
		labeledIndices: OptionalParam(NumberArrayValidator),
	})

	const calendarUnit = await CalendarService.getCalendarUnitById({ calendarId, unitId })

	await AuthorizationService.checkUserCalendarWriteAccessById(ctx.user, calendarId)

	const { unit } = await CalendarPresentationService.createCalendarPresentationUnit({
		calendarId,
		presentationId,
		params: {
			unitId,
			name: calendarUnit.displayName || calendarUnit.name,
			formatString: formatString ?? '',
			subdivision,
			labeledIndices,
		},
	})

	const calendar = await CalendarService.getEditorCalendar({ calendarId })

	if (calendar.worldId) {
		RedisService.notifyAboutCalendarUpdate(ctx, { worldId: calendar.worldId, calendar })
	}

	return unit
})

router.patch('/api/calendar/:calendarId/presentation/:presentationId/units/:unitId', async (ctx) => {
	useApiEndpoint({
		name: 'updateCalendarPresentationUnit',
		description: 'Updates a unit from the target calendar presentation',
		tags: [calendarTag],
	})

	const { calendarId, unitId } = usePathParams(ctx, {
		calendarId: PathParam(StringValidator),
		presentationId: PathParam(StringValidator),
		unitId: PathParam(StringValidator),
	})

	const { formatString, subdivision, labeledIndices } = useRequestBody(ctx, {
		formatString: OptionalParam(StringValidator),
		subdivision: OptionalParam(NumberValidator),
		labeledIndices: OptionalParam(NumberArrayValidator),
	})

	await AuthorizationService.checkUserCalendarWriteAccessById(ctx.user, calendarId)

	const { unit } = await CalendarPresentationService.updateCalendarPresentationUnit({
		calendarId,
		unitId,
		params: {
			formatString,
			subdivision,
			labeledIndices,
		},
	})

	const calendar = await CalendarService.getEditorCalendar({ calendarId })

	if (calendar.worldId) {
		RedisService.notifyAboutCalendarUpdate(ctx, { worldId: calendar.worldId, calendar })
	}

	return unit
})

router.delete('/api/calendar/:calendarId/presentation/:presentationId/units/:unitId', async (ctx) => {
	useApiEndpoint({
		name: 'deleteCalendarPresentationUnit',
		description: 'Deletes a unit from the target calendar presentation',
		tags: [calendarTag],
	})

	const { calendarId, unitId } = usePathParams(ctx, {
		calendarId: PathParam(StringValidator),
		presentationId: PathParam(StringValidator),
		unitId: PathParam(StringValidator),
	})

	await AuthorizationService.checkUserCalendarWriteAccessById(ctx.user, calendarId)

	const { unit } = await CalendarPresentationService.deleteCalendarPresentationUnit({
		calendarId,
		unitId,
	})

	const calendar = await CalendarService.getEditorCalendar({ calendarId })

	if (calendar.worldId) {
		RedisService.notifyAboutCalendarUpdate(ctx, { worldId: calendar.worldId, calendar })
	}

	return unit
})

export const CalendarPresentationRouter = router
