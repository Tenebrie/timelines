export function loadSafariPolyfills() {
	if (window.requestIdleCallback) {
		console.info('Loading requestIdleCallback polyfill')
		window.requestIdleCallback = function (callback: IdleRequestCallback): number {
			const start = Date.now()
			return window.setTimeout(() => {
				callback({
					didTimeout: false,
					timeRemaining: function () {
						return Math.max(0, 50 - (Date.now() - start))
					},
				})
			}, 1)
		}
	}

	if (!window.cancelIdleCallback) {
		window.cancelIdleCallback = function (id: number): void {
			clearTimeout(id)
		}
	}
}
