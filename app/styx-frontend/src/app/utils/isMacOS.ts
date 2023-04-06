export const isMacOS = () =>
	window.navigator.userAgentData?.platform === 'macOS' || window.navigator.platform === 'MacIntel'
