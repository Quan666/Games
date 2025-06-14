<template>
  <!-- 竖屏布局控制面板 -->
  <div v-if="isPortrait" class="bg-white/95 backdrop-blur-sm p-4 shadow-lg">
    <div class="space-y-3">
      <!-- 按钮组 -->
      <div class="flex gap-3">
        <button
          @click="$emit('reset-game')"
          class="flex-1 py-3 bg-white/20 backdrop-blur-sm text-gray-800 rounded-lg font-semibold hover:bg-white/30 transform hover:scale-102 transition-all duration-200 border border-gray-300"
        >
          重新开始
        </button>
        <button
          @click="$emit('undo-move')"
          :disabled="!canUndo"
          class="flex-1 py-3 bg-white/20 backdrop-blur-sm text-gray-800 rounded-lg font-semibold hover:bg-white/30 transform hover:scale-102 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300"
        >
          悔棋
        </button>
        <!-- AI对战AI控制按钮区域 - 只在AI对战AI模式下显示 -->
        <button
          @click="$emit('toggle-ai-vs-ai')"
          :disabled="gameOver"
          v-if="gameMode === 'ave'"
          :class="
            props.aiVsAiGameRunning
              ? 'bg-yellow-600 hover:bg-yellow-700'
              : 'bg-green-600 hover:bg-green-700'
          "
          class="flex-1 py-3 text-white rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-102"
        >
          {{ props.aiVsAiGameRunning ? '⏸️ 暂停' : '▶️ 开始' }}
        </button>
      </div>

      <!-- 游戏模式切换按钮 -->
      <div class="flex gap-3">
        <button
          @click="store.commit('updateGameMode', 'pvp')"
          :disabled="aiThinking"
          :class="gameMode === 'pvp' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'"
          class="w-full py-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50"
        >
          🎮 双人对战
        </button>
        <button
          @click="store.commit('updateGameMode', 'pve')"
          :disabled="aiThinking"
          :class="gameMode === 'pve' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'"
          class="w-full py-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50"
        >
          🤖 人机对战
        </button>
        <button
          @click="store.commit('updateGameMode', 'ave')"
          :disabled="aiThinking"
          :class="gameMode === 'ave' ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-700'"
          class="w-full py-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50"
        >
          🎯 AI对战AI
        </button>
      </div>

      <div class="flex gap-3">
        <!-- 游戏设置按钮 -->
        <button
          @click="openGameSettings"
          class="w-full py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transform hover:scale-102 transition-all duration-200"
        >
          ⚙️ 游戏设置
        </button>
        <!-- AI设置按钮 -->
        <button
          @click="openAISettings"
          v-if="gameMode === 'pve' || gameMode === 'ave'"
          class="w-full py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transform hover:scale-102 transition-all duration-200"
        >
          ⚙️ AI设置
        </button>
      </div>
    </div>
  </div>

  <!-- 横屏布局控制面板 -->
  <div v-else class="">
    <!-- 控制按钮 -->
    <div class="space-y-3">
      <div class="grid gap-2" :class="gameMode === 'ave' ? 'grid-cols-3' : 'grid-cols-2'">
        <button
          @click="$emit('reset-game')"
          class="w-full py-3 bg-white/20 backdrop-blur-sm text-gray-800 rounded-lg font-semibold hover:bg-white/30 transform hover:scale-105 transition-all duration-200 border border-gray-300"
        >
          重新开始
        </button>
        <button
          @click="$emit('undo-move')"
          :disabled="!canUndo"
          class="w-full py-3 bg-white/20 backdrop-blur-sm text-gray-800 rounded-lg font-semibold hover:bg-white/30 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300"
        >
          悔棋
        </button>
        <!-- AI对战AI控制按钮区域 - 只在AI对战AI模式下显示 -->
        <button
          @click="$emit('toggle-ai-vs-ai')"
          :disabled="gameOver"
          v-if="gameMode === 'ave'"
          :class="
            props.aiVsAiGameRunning
              ? 'bg-yellow-600 hover:bg-yellow-700'
              : 'bg-green-600 hover:bg-green-700'
          "
          class="w-full py-3 text-white rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
        >
          {{ props.aiVsAiGameRunning ? '⏸️ 暂停' : '▶️ 开始' }}
        </button>
      </div>

      <div class="grid grid-cols-3 gap-2 text-xs">
        <button
          @click="store.commit('updateGameMode', 'pvp')"
          :disabled="aiThinking"
          :class="gameMode === 'pvp' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'"
          class="w-full py-2 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50"
        >
          🎮 双人
        </button>
        <button
          @click="store.commit('updateGameMode', 'pve')"
          :disabled="aiThinking"
          :class="gameMode === 'pve' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'"
          class="w-full py-2 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50"
        >
          🤖 人机
        </button>
        <button
          @click="store.commit('updateGameMode', 'ave')"
          :disabled="aiThinking"
          :class="gameMode === 'ave' ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-700'"
          class="w-full py-2 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50"
        >
          🎯 AI对AI
        </button>
      </div>

      <div class="grid gap-2" :class="gameMode === 'pvp' ? 'grid-cols-1' : 'grid-cols-2'">
        <!-- 游戏设置按钮 -->
        <button
          @click="openGameSettings"
          class="w-full py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transform hover:scale-105 transition-all duration-200"
        >
          ⚙️ 游戏设置
        </button>
        <!-- AI设置按钮 -->
        <button
          v-if="gameMode === 'pve' || gameMode === 'ave'"
          @click="openAISettings"
          class="w-full py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transform hover:scale-105 transition-all duration-200"
        >
          ⚙️ AI设置
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineProps } from 'vue'
// @ts-ignore
import { useStore } from 'vuex'

const store = useStore()

const props = defineProps({
  aiVsAiGameRunning: {
    type: Boolean,
    default: false,
  },
})

const isPortrait = computed(() => {
  // 可根据窗口宽高比判断，或由父组件传递。这里简单用 window 判断
  return window.innerHeight > window.innerWidth
})
const gameMode = computed({
  get: () => store.state.gomoku.gameMode,
  set: (v) => store.commit('updateGameMode', v),
})
const canUndo = computed(
  () =>
    store.state.gomoku.gameState.moveHistory.length > 0 &&
    !store.state.gomoku.gameState.aiThinking &&
    !store.state.gomoku.gameState.aiVsAiGameRunning,
)
const gameOver = computed(() => store.state.gomoku.gameState.gameOver)
const aiThinking = computed(() => store.state.gomoku.gameState.aiThinking)

function openGameSettings() {
  store.commit('setShowGameSettings', true)
}
function openAISettings() {
  store.commit('setShowAISettings', true)
  store.commit('setShowGameSettings', false)
}
</script>

<style scoped>
/* 按钮悬停效果 */
.transform.hover\:scale-105:hover {
  transform: scale(1.05);
}

.transform.hover\:scale-102:hover {
  transform: scale(1.02);
}
</style>
