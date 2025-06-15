<template>
  <button @click="goHome" class="home-button" title="回到首页">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
    </svg>
  </button>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}
</script>

<style scoped>
.home-button {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 1000;
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
  .home-button {
    width: 2.2rem;
    height: 2.2rem;
    top: 0.8rem;
    right: 0.8rem;
  }
}

/* 横屏模式调整 */
@media (orientation: landscape) and (max-height: 600px) {
  .home-button {
    top: 0.5rem;
    right: 0.5rem;
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
  .home-button {
    width: 2rem;
    height: 2rem;
    top: 0.6rem;
    right: 0.6rem;
  }

  .home-button svg {
    width: 16px;
    height: 16px;
  }
}
</style>
