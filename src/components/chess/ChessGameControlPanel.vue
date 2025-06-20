<template>
  <!-- 竖屏布局控制面板 -->
  <div v-if="isPortrait" class="bg-white/95 backdrop-blur-sm p-4">
    <div class="space-y-3">
      <!-- 基础控制按钮 -->
      <div class="flex gap-3">
        <button
          @click="resetGame"
          class="flex-1 py-3 bg-white/20 backdrop-blur-sm text-gray-800 rounded-lg font-semibold hover:bg-white/30 transform hover:scale-102 transition-all duration-200 border border-gray-300"
        >
          重新开始
        </button>
        <button
          @click="undoMove"
          :disabled="!canUndoGame"
          class="flex-1 py-3 bg-white/20 backdrop-blur-sm text-gray-800 rounded-lg font-semibold hover:bg-white/30 transform hover:scale-102 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300"
        >
          悔棋
        </button>
        <!-- AI对战AI控制按钮 - 只在AI对战模式下显示 -->
        <button
          @click="toggleAiVsAi"
          v-if="gameMode === 'ai-vs-ai'"
          :class="
            aiVsAiRunning ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'
          "
          class="flex-1 py-3 text-white rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-102"
        >
          {{ aiVsAiRunning ? '⏸️ 暂停' : '▶️ 开始' }}
        </button>
      </div>

      <!-- 游戏模式切换按钮 -->
      <div class="flex gap-2">
        <button
          @click="store.commit('chess/updateGameMode', 'pvp')"
          :disabled="aiThinking"
          :class="gameMode === 'pvp' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'"
          class="flex-1 py-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 text-sm"
        >
          🎮 双人对战
        </button>
        <button
          @click="store.commit('chess/updateGameMode', 'pve')"
          :disabled="aiThinking"
          :class="gameMode === 'pve' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'"
          class="flex-1 py-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 text-sm"
        >
          🤖 人机对战
        </button>
        <button
          @click="store.commit('chess/updateGameMode', 'ai-vs-ai')"
          :disabled="aiThinking"
          :class="
            gameMode === 'ai-vs-ai' ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-700'
          "
          class="flex-1 py-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 text-sm"
        >
          🎯 AI对战
        </button>
      </div>

      <!-- 设置按钮 -->
      <div class="flex gap-3">
        <!-- 游戏设置按钮 -->
        <button
          @click="openGameSettings"
          class="flex-1 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transform hover:scale-102 transition-all duration-200"
        >
          ⚙️ 游戏设置
        </button>
        <!-- AI设置按钮 -->
        <button
          @click="openAISettings"
          v-if="gameMode === 'pve' || gameMode === 'ai-vs-ai'"
          class="flex-1 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transform hover:scale-102 transition-all duration-200"
        >
          🤖 AI设置
        </button>
      </div>
    </div>
  </div>

  <!-- 横屏布局控制面板 -->
  <div v-else class="">
    <!-- 控制按钮 -->
    <div class="space-y-3">
      <div class="grid gap-2" :class="gameMode === 'ai-vs-ai' ? 'grid-cols-3' : 'grid-cols-2'">
        <button
          @click="resetGame"
          class="w-full py-3 bg-white/20 backdrop-blur-sm text-gray-800 rounded-lg font-semibold hover:bg-white/30 transform hover:scale-105 transition-all duration-200 border border-gray-300"
        >
          重新开始
        </button>
        <button
          @click="undoMove"
          :disabled="!canUndoGame"
          class="w-full py-3 bg-white/20 backdrop-blur-sm text-gray-800 rounded-lg font-semibold hover:bg-white/30 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300"
        >
          悔棋
        </button>
        <!-- AI对战AI控制按钮 - 只在AI对战模式下显示 -->
        <button
          @click="toggleAiVsAi"
          v-if="gameMode === 'ai-vs-ai'"
          :class="
            aiVsAiRunning ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'
          "
          class="w-full py-3 text-white rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
        >
          {{ aiVsAiRunning ? '⏸️ 暂停' : '▶️ 开始' }}
        </button>
      </div>

      <!-- 游戏模式切换按钮 -->
      <div class="grid grid-cols-3 gap-2">
        <button
          @click="store.commit('chess/updateGameMode', 'pvp')"
          :disabled="aiThinking"
          :class="gameMode === 'pvp' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'"
          class="w-full py-2 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 text-sm"
        >
          🎮 双人
        </button>
        <button
          @click="store.commit('chess/updateGameMode', 'pve')"
          :disabled="aiThinking"
          :class="gameMode === 'pve' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'"
          class="w-full py-2 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 text-sm"
        >
          🤖 人机
        </button>
        <button
          @click="store.commit('chess/updateGameMode', 'ai-vs-ai')"
          :disabled="aiThinking"
          :class="
            gameMode === 'ai-vs-ai' ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-700'
          "
          class="w-full py-2 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 text-sm"
        >
          🎯 AI对战
        </button>
      </div>

      <!-- 设置按钮 -->
      <div
        class="grid gap-2"
        :class="gameMode === 'pve' || gameMode === 'ai-vs-ai' ? 'grid-cols-2' : 'grid-cols-1'"
      >
        <!-- 游戏设置按钮 -->
        <button
          @click="openGameSettings"
          class="w-full py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transform hover:scale-105 transition-all duration-200"
        >
          ⚙️ 游戏设置
        </button>
        <!-- AI设置按钮 -->
        <button
          @click="openAISettings"
          v-if="gameMode === 'pve' || gameMode === 'ai-vs-ai'"
          class="w-full py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transform hover:scale-105 transition-all duration-200"
        >
          🤖 AI设置
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
// @ts-ignore
import { useStore } from 'vuex'

// 定义 emits
const emit = defineEmits<{
  'reset-game': []
  'undo-move': []
}>()

const store = useStore()

const isPortrait = computed(() => {
  // 可根据窗口宽高比判断，或由父组件传递。这里简单用 window 判断
  return window.innerHeight > window.innerWidth
})

// 从 store 读取状态
const gameMode = computed(() => store.state.chess.settings.gameMode)
const canUndo = computed(() => store.state.chess.gameState.moveHistory.length > 0)
const aiThinking = computed(() => store.state.chess.gameState.aiThinking)
const aiVsAiRunning = computed(() => store.state.chess.gameState.aiVsAiRunning)

// 计算是否可以悔棋：有历史记录 且 AI未在思考 且 (非AI对AI模式 或 AI对AI已暂停)
const canUndoGame = computed(() => {
  return (
    canUndo.value && !aiThinking.value && (gameMode.value !== 'ai-vs-ai' || !aiVsAiRunning.value)
  )
})

// 方法：通过 emit 调用父组件的方法
function resetGame() {
  emit('reset-game')
}

function undoMove() {
  if (canUndoGame.value) {
    emit('undo-move')
  }
}

function toggleAiVsAi() {
  store.commit('chess/updateGameState', {
    aiVsAiRunning: !aiVsAiRunning.value,
  })
}

function openGameSettings() {
  store.commit('chess/setShowGameSettings', true)
}

function openAISettings() {
  store.commit('chess/setShowAISettings', true)
  store.commit('chess/setShowGameSettings', false)
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
