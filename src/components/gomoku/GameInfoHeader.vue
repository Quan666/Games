<template>
  <!-- 顶部信息 -->
  <div class="bg-white/95 backdrop-blur-sm p-4 shadow-lg" v-if="isPortrait">
    <div class="text-center">
      <h1 class="text-2xl font-bold text-gray-800 mb-2">五子棋</h1>
      <div class="flex items-center justify-center gap-2 mb-2 flex-wrap">
        <span class="text-base font-semibold text-gray-800">当前玩家:</span>
        <span class="font-bold text-base">{{ currentPlayerText }}(回合:{{ moveCount }})</span>
        <div
          class="w-5 h-5 rounded-full border-2 border-gray-800"
          :class="currentPlayer === 1 ? 'bg-black' : 'bg-white'"
        ></div>
      </div>
      <!-- AI思考状态 - 固定高度避免布局跳动 -->
      <div class="h-6 flex items-center justify-center mb-2">
        <div v-if="aiThinking" class="flex items-center gap-1 text-blue-600">
          <div
            class="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"
          ></div>
          <span class="text-sm font-medium">{{
            gameMode === 'pvp' || aiInitialized ? 'AI思考中' : '初始化中'
          }}</span>
        </div>
      </div>
      <div v-if="gameMode === 'pve'" class="text-sm text-gray-600">
        {{ `${aiPlayer == 1 ? 'AI执黑棋' : 'AI执白棋'} | 强度: ${aiSettings.strength}%` }}
      </div>
      <div
        v-if="gameMode === 'ave'"
        class="text-sm text-gray-600 flex items-center justify-center gap-2"
      >
        <span class="flex items-center gap-1">
          <span class="inline-block w-3 h-3 rounded-full bg-black border border-gray-700"></span>
          AI1:{{ aiVsAiSettings.aiPlayer1Strength }}%
        </span>
        <span>VS</span>
        <span class="flex items-center gap-1">
          <span class="inline-block w-3 h-3 rounded-full bg-white border border-gray-700"></span>
          AI2:{{ aiVsAiSettings.aiPlayer2Strength }}%
        </span>
      </div>
    </div>
  </div>
  <!-- 横屏布局信息 -->
  <div v-else class="">
    <!-- 标题 -->
    <h1 class="text-3xl font-bold text-gray-800 text-center">五子棋</h1>
    <!-- 当前玩家 -->
    <div class="bg-white/80 rounded-lg p-4 text-center">
      <div class="text-base font-semibold text-gray-800 mb-2">
        当前玩家: <span class="font-bold">{{ currentPlayerText }}(回合:{{ moveCount }})</span>
      </div>
      <div class="flex justify-center mb-2">
        <div
          class="w-8 h-8 rounded-full border-2 border-gray-800"
          :class="currentPlayer === 1 ? 'bg-black' : 'bg-white'"
        ></div>
      </div>
      <!-- AI思考状态 - 固定高度避免布局跳动 -->
      <div class="h-6 flex items-center justify-center mb-2">
        <div v-if="aiThinking" class="flex items-center justify-center gap-2 text-blue-600">
          <div
            class="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"
          ></div>
          <span class="text-sm font-medium">{{
            gameMode === 'pvp' || aiInitialized ? 'AI思考中' : '初始化中'
          }}</span>
        </div>
      </div>
      <div v-if="gameMode === 'pve'" class="text-sm text-gray-600">
        {{ aiPlayer == 1 ? 'AI执黑棋' : 'AI执白棋' }} | 强度: {{ aiSettings.strength }}%
      </div>
      <div
        v-if="gameMode === 'ave'"
        class="text-sm text-gray-600 flex items-center justify-center gap-2"
      >
        <span class="flex items-center gap-1">
          <span class="inline-block w-3 h-3 rounded-full bg-black border border-gray-700"></span>
          AI1:{{ aiVsAiSettings.aiPlayer1Strength }}%
        </span>
        <span>VS</span>
        <span class="flex items-center gap-1">
          <span class="inline-block w-3 h-3 rounded-full bg-white border border-gray-700"></span>
          AI2:{{ aiVsAiSettings.aiPlayer2Strength }}%
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
// @ts-ignore
import { useStore } from 'vuex'

const store = useStore()
const isPortrait = computed(() => {
  // 可根据窗口宽高比判断，或由父组件传递。这里简单用 window 判断
  return window.innerHeight > window.innerWidth
})
const currentPlayer = computed(() => store.state.gomoku.gameState.currentPlayer)
const moveCount = computed(() => store.state.gomoku.gameState.moveCount)
const aiThinking = computed(() => store.state.gomoku.gameState.aiThinking)
const gameMode = computed(() => store.state.gomoku.gameMode)
const aiInitialized = computed(
  () =>
    store.state.gomoku.gameState.moveCount > 0 ||
    store.state.gomoku.gameState.aiThinkingStartTime !== null,
)
const aiPlayer = computed(() => store.state.gomoku.aiPlayer)
const aiSettings = computed(() => store.state.gomoku.aiSettings)
const aiVsAiSettings = computed(() => store.state.gomoku.aiVsAiSettings)

const currentPlayerText = computed(() => {
  if (gameMode.value === 'ave') {
    return currentPlayer.value === 1 ? 'AI1(黑)' : 'AI2(白)'
  }
  if (gameMode.value === 'pve') {
    if (aiPlayer.value === 1) {
      return currentPlayer.value === 1 ? 'AI(黑)' : '玩家(白)'
    } else {
      return currentPlayer.value === 1 ? '玩家(黑)' : 'AI(白)'
    }
  }
  return currentPlayer.value === 1 ? '黑棋' : '白棋'
})
</script>
