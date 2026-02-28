export function getSessionStorageItem<T>(key: string): T | null {
	const item = sessionStorage.getItem(key)
	if (!item) {
		return null
	}
	try {
		return JSON.parse(item) as T
	} catch (e) {
		console.error(`Error parsing session storage item for key ${key}:`, e)
		return null
	}
}

export function setSessionStorageItem<T>(key: string, value: T): void {
	try {
		sessionStorage.setItem(key, JSON.stringify(value))
	} catch (e) {
		console.error(`Error setting session storage item for key ${key}:`, e)
	}
}

export function removeSessionStorageItem(key: string): void {
	try {
		sessionStorage.removeItem(key)
	} catch (e) {
		console.error(`Error removing session storage item for key ${key}:`, e)
	}
}
