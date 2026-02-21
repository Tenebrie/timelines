/**
 * Performs a binary search on a sorted array and returns the closest match to the target value.
 * @param arr - A sorted array of numbers (ascending order)
 * @param target - The target value to find the closest match for
 * @returns The value in the array that is closest to the target, or undefined if the array is empty
 */
export function binarySearchForClosest(arr: number[], target: number): number {
	if (arr.length === 0) {
		throw new Error('Array is empty')
	}

	if (arr.length === 1) {
		return arr[0]
	}

	let left = 0
	let right = arr.length - 1

	while (left < right) {
		const mid = Math.floor((left + right) / 2)

		if (arr[mid] === target) {
			return arr[mid]
		}

		if (arr[mid] < target) {
			left = mid + 1
		} else {
			right = mid
		}
	}

	// At this point, left === right
	// We need to check if the adjacent element (if exists) is closer
	const idx = left

	// If we're at the first element, it's the closest
	if (idx === 0) {
		return arr[0]
	}

	// Compare with the previous element to find the closest
	const prev = arr[idx - 1]
	const curr = arr[idx]

	if (Math.abs(prev - target) <= Math.abs(curr - target)) {
		return prev
	}

	return curr
}
