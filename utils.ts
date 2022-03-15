export function delay(millSeconds: number) {
	return new Promise<void>((resolve, _) => {
		setTimeout(() => {
			resolve()
		}, millSeconds)
	})
}
