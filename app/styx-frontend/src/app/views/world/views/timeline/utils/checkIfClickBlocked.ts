export function checkIfClickBlocked(target: EventTarget | null, depth = 0): boolean {
	if (depth >= 10 || (!(target instanceof HTMLElement) && !(target instanceof SVGElement))) {
		return false
	}
	if (target.classList.contains('block-timeline')) {
		return true
	}
	return checkIfClickBlocked(target.parentNode, depth + 1)
}
