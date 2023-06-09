export const arraysEqual = <FirstT, SecondT>(
	arrayA: FirstT[],
	arrayB: SecondT[],
	compareFunction: (a: FirstT, b: SecondT) => boolean
): boolean => {
	return (
		arrayA.every((a) => arrayB.some((b) => compareFunction(a, b))) &&
		arrayB.every((b) => arrayA.some((a) => compareFunction(a, b)))
	)
}
