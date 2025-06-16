<template>
  <div
    ref="elementRef"
    class="home-button-container"
    @mousedown="handleMouseDown"
    :class="{ dragging: isDragging }"
  >
    <button @click="goHome" class="home-button" title="回到首页 (可拖动)">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useDraggable } from '../composables/useDraggable'

const router = useRouter()
const { elementRef, isDragging, startDrag } = useDraggable()

// 记录鼠标按下时的位置
const mouseDownPos = ref({ x: 0, y: 0 })
const hasMoved = ref(false)

const handleMouseDown = (event: MouseEvent) => {
  mouseDownPos.value = { x: event.clientX, y: event.clientY }
  hasMoved.value = false

  startDrag(event)

  const handleMouseMove = (moveEvent: MouseEvent) => {
    const deltaX = Math.abs(moveEvent.clientX - mouseDownPos.value.x)
    const deltaY = Math.abs(moveEvent.clientY - mouseDownPos.value.y)

    // 如果鼠标移动超过5像素，认为是拖动
    if (deltaX > 5 || deltaY > 5) {
      hasMoved.value = true
    }
  }

  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }

  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

const goHome = () => {
  // 只有在没有移动且不在拖动状态时才跳转
  if (!hasMoved.value && !isDragging.value) {
    router.push('/')
  }
}
</script>

<style scoped>
.home-button-container {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 1000;
}

.home-button-container.dragging {
  z-index: 1001;
}

.home-button {
  width: 2.5rem;
  height: 2.5rem;
  background: rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 0.5rem;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.home-button:hover {
  background: rgba(0, 0, 0, 0.2);
  color: rgba(255, 255, 255, 1);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.home-button:active {
  transform: translateY(0);
}

/* 移动端适配 */
@media (max-width: 768px) {
  .home-button-container {
    top: 0.8rem;
    right: 0.8rem;
  }

  .home-button {
    width: 2.2rem;
    height: 2.2rem;
  }
}

/* 横屏模式调整 */
@media (orientation: landscape) and (max-height: 600px) {
  .home-button-container {
    top: 0.5rem;
    right: 0.5rem;
  }

  .home-button {
    width: 2rem;
    height: 2rem;
  }

  .home-button svg {
    width: 16px;
    height: 16px;
  }
}

/* 超小屏幕适配 */
@media (max-width: 480px) {
  .home-button-container {
    top: 0.6rem;
    right: 0.6rem;
  }

  .home-button {
    width: 2rem;
    height: 2rem;
  }

  .home-button svg {
    width: 16px;
    height: 16px;
  }
}
</style>
