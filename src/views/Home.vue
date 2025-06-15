<template>
  <div
    class="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden"
  >
    <!-- 右上角按钮组 -->
    <div class="absolute top-6 right-8 z-20 flex items-center space-x-4 mobile-header-buttons">
      <!-- 全局设置按钮 -->
      <button
        @click="showGlobalSettings = true"
        class="text-white hover:text-blue-400 transition-colors p-2 rounded-lg hover:bg-white/10"
        title="全局设置"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path
            d="M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8M12,10A2,2 0 0,0 10,12A2,2 0 0,0 12,14A2,2 0 0,0 14,12A2,2 0 0,0 12,10M10,22C9.75,22 9.54,21.82 9.5,21.58L9.13,18.93C8.5,18.68 7.96,18.34 7.44,17.94L4.95,18.95C4.73,19.03 4.46,18.95 4.34,18.73L2.34,15.27C2.21,15.05 2.27,14.78 2.46,14.63L4.57,12.97L4.5,12L4.57,11L2.46,9.37C2.27,9.22 2.21,8.95 2.34,8.73L4.34,5.27C4.46,5.05 4.73,4.96 4.95,5.05L7.44,6.05C7.96,5.66 8.5,5.32 9.13,5.07L9.5,2.42C9.54,2.18 9.75,2 10,2H14C14.25,2 14.46,2.18 14.5,2.42L14.87,5.07C15.5,5.32 16.04,5.66 16.56,6.05L19.05,5.05C19.27,4.96 19.54,5.05 19.66,5.27L21.66,8.73C21.79,8.95 21.73,9.22 21.54,9.37L19.43,11L19.5,12L19.43,13L21.54,14.63C21.73,14.78 21.79,15.05 21.66,15.27L19.66,18.73C19.54,18.95 19.27,19.04 19.05,18.95L16.56,17.95C16.04,18.34 15.5,18.68 14.87,18.93L14.5,21.58C14.46,21.82 14.25,22 14,22H10M11.25,4L10.88,6.61C9.68,6.86 8.62,7.5 7.85,8.39L5.44,7.35L4.69,8.65L6.8,10.2C6.4,11.37 6.4,12.64 6.8,13.8L4.68,15.36L5.43,16.66L7.86,15.62C8.63,16.5 9.68,17.14 10.87,17.38L11.24,20H12.76L13.13,17.39C14.32,17.14 15.37,16.5 16.14,15.62L18.57,16.66L19.32,15.36L17.2,13.81C17.6,12.64 17.6,11.37 17.2,10.2L19.31,8.65L18.56,7.35L16.15,8.39C15.38,7.5 14.32,6.86 13.12,6.62L12.75,4H11.25Z"
          />
        </svg>
      </button>

      <!-- GitHub 图标按钮 -->
      <a
        href="https://github.com/Quan666/Games"
        target="_blank"
        rel="noopener noreferrer"
        class="text-white hover:text-blue-400 transition-colors p-2 rounded-lg hover:bg-white/10"
        title="GitHub"
      >
        <svg height="24" width="24" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <path
            d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.01.08-2.11 0 0 .67-.21 2.2.82a7.65 7.65 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.91.08 2.11.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"
          />
        </svg>
      </a>
    </div>
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
      <div class="text-center mb-16 mobile-title-section">
        <h1 class="text-6xl font-bold text-white mb-4 animate-pulse">🎮 游戏中心</h1>
        <p class="text-xl text-gray-300 max-w-2xl mx-auto">
          欢迎来到经典游戏世界，选择您喜欢的游戏开始挑战吧！
        </p>
      </div>
      <!-- 游戏网格 -->
      <div class="game-grid">
        <!-- 五子棋 -->
        <div class="game-card group" @click="goToGame('/wuziqi')">
          <div class="game-icon">⚫⚪</div>
          <h3 class="game-title">五子棋</h3>
          <p class="game-description">经典策略游戏，与AI对战，考验你的逻辑思维能力</p>
          <div class="game-status available">可游玩</div>
        </div>

        <!-- 象棋 -->
        <div class="game-card group" @click="goToGame('/chess')">
          <div class="game-icon">♞♜</div>
          <h3 class="game-title">中国象棋</h3>
          <p class="game-description">千年传承的经典棋类，体验传统文化的魅力</p>
          <div class="game-status coming-soon">开发中</div>
        </div>
      </div>

      <!-- 统计信息 -->
      <div class="mt-16 text-center">
        <div
          class="inline-flex items-center space-x-8 bg-white/10 backdrop-blur-sm rounded-full px-8 py-4"
        >
          <div class="text-center">
            <div class="text-2xl font-bold text-white">2</div>
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

    <!-- 全局设置弹窗 -->
    <GlobalSettings :show="showGlobalSettings" @close="showGlobalSettings = false" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import GlobalSettings from '../components/GlobalSettings.vue'

const router = useRouter()
const showGlobalSettings = ref(false)

const goToGame = (path: string) => {
  router.push(path)
}
</script>

<style scoped>
/* 移动端头部按钮调整 */
@media (max-width: 768px) {
  .mobile-header-buttons {
    top: 1rem !important;
    right: 1rem !important;
  }

  .mobile-title-section {
    margin-top: 3rem;
    margin-bottom: 3rem !important;
  }

  .mobile-title-section h1 {
    font-size: 3rem !important;
  }

  .mobile-title-section p {
    font-size: 1rem !important;
    padding: 0 1rem;
  }
}

.game-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  max-width: 800px;
  margin: 0 auto;
  justify-items: center;
  padding: 0 1rem;
}

/* 移动端样式调整 */
@media (max-width: 768px) {
  .game-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    max-width: 100%;
    padding: 0 1rem;
  }
}

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
  width: 100%;
  max-width: 350px;
  animation: cardFloat 4s ease-in-out infinite;
}

/* 移动端卡片样式 */
@media (max-width: 768px) {
  .game-card {
    padding: 1.2rem;
    max-width: none;
    border-radius: 0.75rem;
    animation: cardFloat 3s ease-in-out infinite;
  }
}

/* 为每个卡片添加不同的动画延迟 */
.game-card:nth-child(1) {
  animation-delay: 0s;
}

.game-card:nth-child(2) {
  animation-delay: 1.5s;
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
  animation: iconPulse 3s ease-in-out infinite;
}

/* 移动端图标样式 */
@media (max-width: 768px) {
  .game-icon {
    font-size: 2.5rem;
    margin-bottom: 0.75rem;
  }
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

/* 移动端标题样式 */
@media (max-width: 768px) {
  .game-title {
    font-size: 1.1rem;
    margin-bottom: 0.4rem;
  }
}

.game-description {
  color: #d1d5db;
  font-size: 0.875rem;
  line-height: 1.625;
  margin-bottom: 1rem;
  min-height: 3rem;
}

/* 移动端描述样式 */
@media (max-width: 768px) {
  .game-description {
    font-size: 0.75rem;
    line-height: 1.4;
    margin-bottom: 0.5rem;
    min-height: 2rem;
  }
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

/* 移动端状态标签样式 */
@media (max-width: 768px) {
  .game-status {
    padding: 0.15rem 0.5rem;
    font-size: 0.65rem;
    top: 0.6rem;
    right: 0.6rem;
  }
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

@keyframes cardFloat {
  0%,
  100% {
    transform: translateY(0px) scale(1);
  }

  50% {
    transform: translateY(-5px) scale(1.02);
  }
}

@keyframes iconPulse {
  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.1);
  }
}

.game-card:hover .game-icon {
  animation: float 2s ease-in-out infinite;
  transform: scale(1.2);
}
</style>
