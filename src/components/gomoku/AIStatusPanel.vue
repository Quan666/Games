<template>
  <div
    v-if="showStatusPanel && (gameMode === 'pve' || gameMode === 'ave')"
    ref="elementRef"
    class="fixed top-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl p-3 max-w-xs w-full max-h-[85vh] overflow-y-auto shadow-xl z-40 border border-gray-200 md:max-w-xs md:top-4 md:right-4 md:w-80 max-md:top-2 max-md:right-2 max-md:left-auto max-md:max-w-[280px] max-md:w-[280px]"
    :class="{ 'cursor-move': isDragging }"
  >
    <div
      class="flex justify-between items-center mb-2 cursor-move select-none"
      @mousedown="startDrag"
    >
      <h3 class="text-sm font-bold text-gray-800 max-md:text-xs flex items-center">🧠 AI监控</h3>
      <button
        @click="closePanel"
        class="text-gray-500 hover:text-gray-700 text-lg max-md:text-base p-1"
      >
        &times;
      </button>
    </div>

    <!-- 引擎运行状态 -->
    <div
      class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-2 mb-3 max-md:p-1.5 max-md:mb-2"
    >
      <h4 class="text-xs font-semibold text-blue-800 mb-1 flex items-center max-md:text-[10px]">
        ⚙️ 引擎状态
      </h4>
      <div class="grid grid-cols-2 gap-1.5 text-[10px] max-md:gap-1 max-md:text-[9px]">
        <div class="bg-white/70 rounded p-1.5 max-md:p-1">
          <div class="text-gray-600">思考时间</div>
          <div class="font-bold text-blue-600">{{ aiStatus.thinkTime }}ms</div>
        </div>
        <div class="bg-white/70 rounded p-1.5 max-md:p-1">
          <div class="text-gray-600">累计用时</div>
          <div class="font-bold text-green-600">{{ aiStatus.totalTimeUsed }}ms</div>
        </div>
        <div class="bg-white/70 rounded p-1.5 max-md:p-1">
          <div class="text-gray-600">引擎状态</div>
          <div
            class="font-bold"
            :class="aiStatus.engineReady === '已就绪' ? 'text-green-600' : 'text-red-600'"
          >
            {{ aiStatus.engineReady }}
          </div>
        </div>
        <div class="bg-white/70 rounded p-1.5 max-md:p-1">
          <div class="text-gray-600">思考状态</div>
          <div class="font-bold" :class="aiThinking ? 'text-blue-600' : 'text-gray-600'">
            {{ aiStatus.thinkingStatus }}
          </div>
        </div>
      </div>
    </div>

    <!-- AI实时分析 -->
    <div
      class="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-2 mb-3 max-md:p-1.5 max-md:mb-2"
    >
      <h4 class="text-xs font-semibold text-green-800 mb-1 max-md:text-[10px]">🧠 实时分析</h4>
      <div class="grid grid-cols-2 gap-1.5 text-[10px] max-md:gap-1 max-md:text-[9px]">
        <div class="bg-white/70 rounded p-1 flex justify-between max-md:p-0.5">
          <span class="text-gray-600">搜索深度:</span>
          <span class="font-semibold">{{ aiStatus.searchDepth }}/{{ aiStatus.selDepth }}</span>
        </div>
        <div class="bg-white/70 rounded p-1.5 flex justify-between max-md:p-1">
          <span class="text-gray-600">搜索节点:</span>
          <span class="font-semibold">{{ aiStatus.searchNodes }}</span>
        </div>
        <div class="bg-white/70 rounded p-1.5 flex justify-between max-md:p-1">
          <span class="text-gray-600">搜索速度:</span>
          <span class="font-semibold">{{ aiStatus.searchSpeed }}</span>
        </div>
        <div class="bg-white/70 rounded p-1.5 flex justify-between max-md:p-1">
          <span class="text-gray-600">胜率:</span>
          <span class="font-semibold">{{ aiStatus.winRate }}</span>
        </div>
        <div class="bg-white/70 rounded p-1.5 flex justify-between col-span-2 max-md:p-1">
          <span class="text-gray-600">最佳落点:</span>
          <span class="font-semibold">{{ aiStatus.bestMove }}</span>
        </div>
        <div class="bg-white/70 rounded p-1.5 col-span-2 max-md:p-1">
          <div class="flex justify-between items-center mb-1">
            <span class="text-gray-600 text-xs">思考路径:</span>
            <span class="text-xs text-gray-500">前5步</span>
          </div>
          <div class="font-semibold text-xs leading-tight text-blue-600 break-all">
            {{ aiStatus.realtimeThinking || '等待AI分析...' }}
          </div>
        </div>
      </div>
    </div>

    <!-- AI引擎日志 -->
    <div class="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-2 max-md:p-1.5">
      <h4 class="text-xs font-semibold text-gray-800 mb-1 max-md:text-[10px]">📋 引擎日志</h4>
      <div
        class="bg-black rounded p-1.5 h-24 overflow-y-auto font-mono text-[10px] max-md:h-20 max-md:text-[9px] max-md:p-1"
      >
        <div
          v-for="(log, index) in aiLogs.slice(-20)"
          :key="index"
          :class="getLogClass(log.type)"
          class="mb-0.5 max-md:mb-0"
        >
          <span class="text-gray-400">[{{ log.time }}]</span> {{ log.message }}
        </div>
        <div v-if="aiLogs.length === 0" class="text-green-400 text-center py-2 max-md:py-1">
          等待AI引擎输出...
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
// @ts-ignore
import { useStore } from 'vuex'
import { useDraggable } from '../../composables/useDraggable'

// 类型定义
interface AILog {
  time: string
  type: 'info' | 'warning' | 'error' | 'success'
  message: string
}

interface AIStatus {
  thinkTime: number
  totalTimeUsed: number
  engineReady: string
  thinkingStatus: string
  searchDepth: string
  selDepth: string
  searchNodes: string
  searchSpeed: string
  winRate: string
  bestMove: string
  realtimeThinking: string
}

// Props（去除 show）
defineProps<{
  gameMode: string
  aiStatus: AIStatus
  aiThinking: boolean
  aiLogs: AILog[]
}>()

const store = useStore()
const showStatusPanel = computed(() => store.state.gomoku.gameSettings.showStatusPanel)

// 拖动功能
const { elementRef, isDragging, startDrag } = useDraggable()

const closePanel = () => {
  store.commit('updateGameSettings', { showStatusPanel: false })
}

// Emits
defineEmits<{
  'test-ai-display': []
}>()

// 方法
const getLogClass = (type: AILog['type']) => {
  switch (type) {
    case 'error':
      return 'text-red-400'
    case 'warning':
      return 'text-yellow-400'
    case 'success':
      return 'text-green-400'
    default:
      return 'text-gray-300'
  }
}
</script>

<style scoped>
/* 状态面板滚动条样式 */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* 日志面板样式 */
.font-mono {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
}

/* 渐变背景 */
.bg-gradient-to-br {
  background-image: linear-gradient(
    to bottom right,
    var(--tw-gradient-from),
    var(--tw-gradient-to)
  );
}

.from-blue-50 {
  --tw-gradient-from: #eff6ff;
}

.to-blue-100 {
  --tw-gradient-to: #dbeafe;
}

.from-green-50 {
  --tw-gradient-from: #f0fdf4;
}

.to-green-100 {
  --tw-gradient-to: #dcfce7;
}

.from-gray-50 {
  --tw-gradient-from: #f9fafb;
}

.to-gray-100 {
  --tw-gradient-to: #f3f4f6;
}
</style>
