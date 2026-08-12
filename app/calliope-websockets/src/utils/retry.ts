export async function retry<T>(action: () => Promise<T>, attempts = 5, delayMs = 1000): Promise<T> {
	for (let attempt = 1; ; attempt++) {
		try {
			return await action()
		} catch (error) {
			if (attempt >= attempts) {
				throw error
			}
			await new Promise((resolve) => setTimeout(resolve, delayMs))
		}
	}
}
