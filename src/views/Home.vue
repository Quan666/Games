<template>
  <div
    class="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden"
  >
    <!-- 右上角 GitHub 图标按钮 -->
    <a
      href="https://github.com/Quan666/Games"
      target="_blank"
      rel="noopener noreferrer"
      class="absolute top-6 right-8 z-20 text-white hover:text-blue-400 transition-colors"
      title="GitHub"
      style="font-size: 2rem"
    >
      <svg height="32" width="32" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
        <path
          d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.01.08-2.11 0 0 .67-.21 2.2.82a7.65 7.65 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.91.08 2.11.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"
        />
      </svg>
    </a>
    <!-- 背景动画点 -->
    <div class="absolute inset-0 overflow-hidden">
      <div
        v-for="i in 20"
        :key="i"
        class="absolute rounded-full bg-white opacity-10 animate-ping"
        :style="{
          left: Math.random() * 100 + '%',
          top: Math.random() * 100 + '%',
          width: Math.random() * 4 + 2 + 'px',
          height: Math.random() * 4 + 2 + 'px',
          animationDelay: Math.random() * 5 + 's',
          animationDuration: Math.random() * 3 + 2 + 's',
        }"
      ></div>
    </div>

    <div class="relative z-10 container mx-auto px-4 py-12">
      <!-- 标题部分 -->
      <div class="text-center mb-16">
        <h1 class="text-6xl font-bold text-white mb-4 animate-pulse">🎮 游戏中心</h1>
        <p class="text-xl text-gray-300 max-w-2xl mx-auto">
          欢迎来到经典游戏世界，选择您喜欢的游戏开始挑战吧！
        </p>
      </div>
      <!-- 游戏网格 -->
      <div class="flex justify-center max-w-6xl mx-auto">
        <!-- 五子棋 -->
        <div class="game-card group" @click="goToGame('/wuziqi')">
          <div class="game-icon">⚫⚪</div>
          <h3 class="game-title">五子棋</h3>
          <p class="game-description">经典策略游戏，与AI对战，考验你的逻辑思维能力</p>
          <div class="game-status available">可游玩</div>
        </div>
      </div>

      <!-- 统计信息 -->
      <div class="mt-16 text-center">
        <div
          class="inline-flex items-center space-x-8 bg-white/10 backdrop-blur-sm rounded-full px-8 py-4"
        >
          <div class="text-center">
            <div class="text-2xl font-bold text-white">1</div>
            <div class="text-sm text-gray-300">游戏总数</div>
          </div>
          <div class="w-px h-8 bg-gray-400"></div>
          <div class="text-center">
            <div class="text-2xl font-bold text-green-400">1</div>
            <div class="text-sm text-gray-300">已完成</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goToGame = (path: string) => {
  router.push(path)
}
</script>

<style scoped>
.game-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 1rem;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transform: scale(1);
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
}

.game-card:hover {
  transform: scale(1.05);
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
}

.game-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.05), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.game-card:hover::before {
  opacity: 1;
}

.game-icon {
  font-size: 3.75rem;
  margin-bottom: 1rem;
  transform: scale(1);
  transition: transform 0.3s ease;
}

.game-card:hover .game-icon {
  transform: scale(1.1);
}

.game-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
  margin-bottom: 0.75rem;
}

.game-description {
  color: #d1d5db;
  font-size: 0.875rem;
  line-height: 1.625;
  margin-bottom: 1rem;
  min-height: 3rem;
}

.game-status {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  position: absolute;
  top: 1rem;
  right: 1rem;
}

.available {
  background: rgba(34, 197, 94, 0.2);
  color: #4ade80;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.coming-soon {
  background: rgba(234, 179, 8, 0.2);
  color: #facc15;
  border: 1px solid rgba(234, 179, 8, 0.3);
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }

  50% {
    transform: translateY(-10px);
  }
}

.game-card:hover .game-icon {
  animation: float 2s ease-in-out infinite;
}
</style>
