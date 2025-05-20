
export function useCompass() {

	const direction = ref<number>(0)

	function update(event: DeviceOrientationEvent) {
		let value = event.alpha ?? 0
		value = Math.trunc(value * 100)
		direction.value = value / 100
	}

	onMounted(() => {
		window.addEventListener("deviceorientationabsolute", update);
	})

	onUnmounted(() => {
		window.removeEventListener("deviceorientationabsolute", update)
	})

	return {
		direction
	}
}