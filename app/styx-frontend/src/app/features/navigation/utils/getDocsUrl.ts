import { isEchoDesktop } from '@/app/utils/isEchoDesktop'

export function getDocsUrl() {
	if (isEchoDesktop) {
		return 'https://neverkin.com/docs'
	}

	return `${window.location.origin.replace('//app.', '//')}/docs`
}
