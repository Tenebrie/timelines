import { CalendarUnitFormatMode, WorldAccessMode } from '@prisma/client'
import { CalendarTemplateId, SupportedCalendarTemplates } from '@src/services/CalendarTemplateService.js'
import { keysOf } from '@src/utils/keysOf.js'
import { Router, useApiEndpoint } from 'moonflower'

const router = new Router()

router.get('/api/constants/admin-levels', async () => {
	useApiEndpoint({
		name: 'adminGetUserLevels',
		description: 'Get all available user levels',
		tags: [],
	})

	return ['Free', 'Premium', 'Admin'] as const
})

router.get('/api/constants/world-access-modes', async () => {
	useApiEndpoint({
		name: 'listWorldAccessModes',
		description: 'Lists all available world access modes.',
	})

	return keysOf(WorldAccessMode)
})

router.get('/api/constants/calendar-templates', async () => {
	useApiEndpoint({
		name: 'listCalendarTemplates',
		description: 'Lists all built-in calendar templates',
	})

	const templates = SupportedCalendarTemplates.filter(
		(template): template is Exclude<CalendarTemplateId, 'earth_2023' | 'pf2e_4723'> =>
			template !== 'earth_2023' && template !== 'pf2e_4723',
	)

	return templates
})

router.get('/api/constants/calendar-unit-format-modes', async () => {
	useApiEndpoint({
		name: 'listCalendarUnitFormatModes',
		description: 'Lists all available calendar unit format modes.',
	})

	return keysOf(CalendarUnitFormatMode)
})

export const ConstantsRouter = router
