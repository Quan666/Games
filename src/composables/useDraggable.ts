import { ref, onUnmounted } from 'vue'

export function useDraggable() {
  const isDragging = ref(false)
  const startX = ref(0)
  const startY = ref(0)
  const translateX = ref(0)
  const translateY = ref(0)
  const elementRef = ref<HTMLElement | null>(null)

  const startDrag = (event: MouseEvent) => {
    isDragging.value = true
    startX.value = event.clientX - translateX.value
    startY.value = event.clientY - translateY.value

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', stopDrag)
  }

  const onMouseMove = (event: MouseEvent) => {
    if (!isDragging.value) return

    translateX.value = event.clientX - startX.value
    translateY.value = event.clientY - startY.value

    if (elementRef.value) {
      elementRef.value.style.transform = `translate(${translateX.value}px, ${translateY.value}px)`
    }
  }

  const stopDrag = () => {
    isDragging.value = false
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', stopDrag)
  }

  const resetPosition = () => {
    translateX.value = 0
    translateY.value = 0
    if (elementRef.value) {
      elementRef.value.style.transform = `translate(0px, 0px)`
    }
  }

  onUnmounted(() => {
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', stopDrag)
  })

  return {
    elementRef,
    isDragging,
    startDrag,
    resetPosition,
    translateX,
    translateY,
  }
}
