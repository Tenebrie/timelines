export const definedProps = <T extends object>(obj: T) =>
	Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as T
