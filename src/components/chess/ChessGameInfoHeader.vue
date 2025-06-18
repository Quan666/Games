<template>
  <!-- 游戏信息头部 -->
  <div class="bg-white/95 backdrop-blur-sm rounded-lg">
    <div class="text-center">
      <h1 class="text-2xl font-bold text-gray-800 mb-3">🐉 中国象棋</h1>

      <!-- 当前玩家信息 -->
      <div class="flex items-center justify-center gap-2 mb-2">
        <span class="text-sm font-semibold text-gray-800">当前玩家:</span>
        <div class="flex items-center gap-1">
          <div
            class="w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-bold"
            :class="
              currentPlayer === 'red'
                ? 'bg-red-500 text-white border-red-600'
                : 'bg-gray-800 text-white border-gray-900'
            "
          >
            {{ currentPlayer === 'red' ? '红' : '黑' }}
          </div>
          <span class="font-bold text-sm">{{ currentPlayerText }}</span>
          <!-- 将军/将死状态 -->
          <span v-if="isCheckmate" class="ml-2 text-red-500 font-bold text-sm"> 被将死💀 </span>
          <span v-else-if="isInCheck" class="ml-2 text-yellow-500 font-bold text-sm">
            被将军⚡
          </span>
        </div>
      </div>

      <!-- 回合信息和AI状态在一行 -->
      <div class="flex items-center justify-center gap-4 mb-2 text-sm min-h-[24px]">
        <span class="font-semibold">回合: {{ moveCount }}</span>

        <!-- AI状态指示器 -->
        <div v-if="gameMode !== 'pvp'" class="flex items-center gap-2">
          <!-- AI初始化中 -->
          <div
            v-if="aiStatus?.status === 'initializing'"
            class="flex items-center gap-2 text-orange-600"
          >
            <div
              class="w-3 h-3 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"
            ></div>
            <span class="font-medium">AI初始化中...</span>
          </div>

          <!-- AI思考中 -->
          <div v-else-if="aiThinking" class="flex items-center gap-2 text-blue-600">
            <div
              class="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"
            ></div>
            <span class="font-medium">AI思考中...</span>
          </div>

          <!-- AI就绪 -->
          <div v-else-if="aiStatus?.ready" class="flex items-center gap-1 text-green-600">
            <div class="w-3 h-3 bg-green-600 rounded-full"></div>
            <span class="font-medium">AI就绪</span>
          </div>

          <!-- AI错误 -->
          <div
            v-else-if="aiStatus?.status === 'error'"
            class="flex items-center gap-1 text-red-600"
          >
            <div class="w-3 h-3 bg-red-600 rounded-full"></div>
            <span class="font-medium">AI错误</span>
          </div>
        </div>
      </div>

      <!-- 游戏模式详细信息 -->
      <div v-if="gameMode === 'pve'" class="text-xs text-gray-600 mt-2">
        {{ `AI执${playerCamp === 'red' ? '黑' : '红'}方 | 棋力: ${aiConfig?.skillLevel || 20}级` }}
      </div>
      <div
        v-if="gameMode === 'ai-vs-ai'"
        class="text-xs text-gray-600 mt-2 flex items-center justify-center gap-2"
      >
        <span class="flex items-center gap-1">
          <div class="w-3 h-3 rounded-full bg-red-500"></div>
          红方AI
        </span>
        <span>VS</span>
        <span class="flex items-center gap-1">
          <div class="w-3 h-3 rounded-full bg-gray-800"></div>
          黑方AI
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance } from 'vue'

// 定义store类型
interface Store {
  state: any
  commit: (type: string, payload?: any) => void
  getters: any
}

// 使用store（直接从全局注入）
const store = getCurrentInstance()?.appContext.config.globalProperties.$store as Store

interface Props {
  // 只保留需要从父组件传递的动态数据
  currentPlayer?: 'red' | 'black'
  moveCount?: number
  aiStatus?: {
    ready: boolean
    status: string
  }
  gameResult?: string
  isInCheck?: boolean // 新增：是否将军
  isCheckmate?: boolean // 新增：是否将死
}

const props = defineProps<Props>()

// 从store获取响应式数据
const gameMode = computed(() => store.state.chess.settings.gameMode)
const playerCamp = computed(() => store.state.chess.settings.playerCamp)
const aiThinking = computed(() => store.state.chess.gameState.aiThinking)
const aiConfig = computed(() => store.getters['chess/getCurrentAiConfig'])

// 从props获取的动态数据
const currentPlayer = computed(() => props.currentPlayer || 'red')
const moveCount = computed(() => props.moveCount || 0)
// @ts-ignore
const gameResult = computed(() => props.gameResult)
const isInCheck = computed(() => props.isInCheck || false)
const isCheckmate = computed(() => props.isCheckmate || false)
const aiStatus = computed(() => props.aiStatus)

const currentPlayerText = computed(() => {
  const mode = gameMode.value
  const player = currentPlayer.value
  const camp = playerCamp.value

  if (mode === 'pvp') {
    return player === 'red' ? '红方' : '黑方'
  } else if (mode === 'pve') {
    if (player === camp) {
      return '玩家'
    } else {
      return 'AI'
    }
  } else {
    return player === 'red' ? 'AI红方' : 'AI黑方'
  }
})

// const gameModeText = computed(() => {
//   switch (props.gameMode) {
//     case 'pvp': return '双人对战'
//     case 'pve': return '人机对战'
//     case 'ai-vs-ai': return 'AI对战'
//     default: return '未知模式'
//   }
// })

// Remove unused function
// const getResultClass = () => {
//   if (!props.gameResult) return ''
//
//   if (props.gameResult.includes('红方胜') || props.gameResult.includes('红胜')) {
//     return 'bg-red-100 text-red-800 border border-red-200'
//   } else if (props.gameResult.includes('黑方胜') || props.gameResult.includes('黑胜')) {
//     return 'bg-gray-100 text-gray-800 border border-gray-200'
//   } else {
//     return 'bg-yellow-100 text-yellow-800 border border-yellow-200'
//   }
// }
</script>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
