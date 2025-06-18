<template>
  <SettingsDialog
    ref="settingsDialogRef"
    v-model="show"
    title="🎮 游戏设置"
    width="1400px"
    max-width="90vw"
    :old-data="originalData"
    :new-data="currentData"
    :apply-callback="handleApply"
    :cancel-callback="handleCancel"
    @close="handleClose"
  >
    <!-- 游戏模式 -->
    <div class="space-y-4 mb-6">
      <h4 class="font-semibold text-gray-700 border-b pb-1">🕹️ 游戏模式</h4>
      <div class="grid grid-cols-3 gap-3">
        <button
          @click="handleSwitchMode('pvp')"
          :disabled="aiThinking"
          :class="gameMode === 'pvp' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'"
          class="w-full py-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50"
        >
          🎮 双人对战
        </button>
        <button
          @click="handleSwitchMode('pve')"
          :disabled="aiThinking"
          :class="gameMode === 'pve' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'"
          class="w-full py-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50"
        >
          🤖 人机对战
        </button>
        <button
          @click="handleSwitchMode('ave')"
          :disabled="aiThinking"
          :class="gameMode === 'ave' ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-700'"
          class="w-full py-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50"
        >
          🎯 AI对战AI
        </button>
      </div>

      <!-- AI执子选择 (仅在人机模式下显示) -->
      <div v-if="gameMode === 'pve'" class="mt-4">
        <label class="block text-sm font-semibold text-gray-700 mb-2">AI 执子</label>
        <div class="flex gap-4">
          <label class="flex items-center">
            <input v-model.number="aiPlayer" type="radio" :value="1" class="mr-2" />
            AI 执黑棋 (先手)
          </label>
          <label class="flex items-center">
            <input v-model.number="aiPlayer" type="radio" :value="2" class="mr-2" />
            AI 执白棋 (后手)
          </label>
        </div>
      </div>

      <!-- AI对战AI设置 -->
      <div v-if="gameMode === 'ave'" class="mt-4 bg-purple-50 rounded-lg p-4">
        <h5 class="text-sm font-semibold text-purple-800 mb-3">AI对战设置</h5>
        <div class="space-y-3">
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">
              AI1强度 (黑棋): {{ aiVsAiSettings.aiPlayer1Strength }}%
            </label>
            <input
              v-model.number="aiVsAiSettings.aiPlayer1Strength"
              type="range"
              min="1"
              max="100"
              step="1"
              class="w-full"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">
              AI2强度 (白棋): {{ aiVsAiSettings.aiPlayer2Strength }}%
            </label>
            <input
              v-model.number="aiVsAiSettings.aiPlayer2Strength"
              type="range"
              min="1"
              max="100"
              step="1"
              class="w-full"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">
              对战速度: {{ aiVsAiSettings.gameSpeed / 1000 }}秒/步
            </label>
            <input
              v-model.number="aiVsAiSettings.gameSpeed"
              type="range"
              min="500"
              max="5000"
              step="500"
              class="w-full"
            />
          </div>
        </div>
      </div>
    </div>
    <!-- AI设置快捷入口 (仅在人机模式下显示) -->
    <div v-if="gameMode === 'pve' || gameMode === 'ave'" class="mb-6">
      <button
        @click="handleOpenAISettings"
        class="w-full py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-all duration-200 mb-3"
      >
        ⚙️ 高级AI设置
      </button>

      <!-- AI状态监控开关 -->
      <div class="bg-gray-50 rounded-lg p-4">
        <h4 class="font-semibold text-gray-700 mb-3">🧠 AI状态监控</h4>
        <label class="flex items-center justify-between">
          <span class="text-sm font-medium">显示AI状态监控面板</span>
          <input
            v-model="gameSettings.showStatusPanel"
            type="checkbox"
            class="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
          />
        </label>
        <p class="text-xs text-gray-500 mt-2">开启后将显示AI实时分析数据和引擎日志</p>
      </div>
    </div>
    <!-- 棋盘设置 -->
    <div class="space-y-4 mb-6">
      <h4 class="font-semibold text-gray-700 border-b pb-1">🏁 棋盘设置</h4>
      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-2">
          棋盘大小: {{ gameSettings.boardSize }}×{{ gameSettings.boardSize }}
        </label>
        <div class="flex gap-2">
          <button
            v-for="size in [13, 15, 19]"
            :key="size"
            @click="gameSettings.boardSize = size"
            :disabled="aiThinking || isGameInProgress"
            :class="
              gameSettings.boardSize === size
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700'
            "
            class="flex-1 py-2 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50"
          >
            {{ size }}×{{ size }}
          </button>
        </div>
        <p class="text-xs text-gray-500 mt-2">
          {{ isGameInProgress ? '游戏进行中无法更改棋盘大小' : '选择棋盘大小，标准五子棋为19×19' }}
        </p>
      </div>
    </div>

    <!-- 显示设置 -->
    <div class="space-y-4 mb-6">
      <h4 class="font-semibold text-gray-700 border-b pb-1">👁️ 显示设置</h4>
      <div class="space-y-3">
        <label class="flex items-center justify-between">
          <span class="text-sm font-medium">显示棋子顺序号</span>
          <input
            v-model="gameSettings.showMoveOrder"
            type="checkbox"
            class="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
          />
        </label>
        <label class="flex items-center justify-between">
          <span class="text-sm font-medium">显示最后一步标记</span>
          <input
            v-model="gameSettings.showLastMove"
            type="checkbox"
            class="w-5 h-5 text-red-600 rounded focus:ring-red-500"
          />
        </label>
        <label class="flex items-center justify-between">
          <span class="text-sm font-medium">显示棋盘坐标</span>
          <input
            v-model="gameSettings.showCoordinates"
            type="checkbox"
            class="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
          />
        </label>
      </div>
    </div>

    <!-- 音效设置 -->
    <div class="space-y-4 mb-6">
      <h4 class="font-semibold text-gray-700 border-b pb-1">🔊 音效设置</h4>
      <div class="space-y-3">
        <label class="flex items-center justify-between">
          <span class="text-sm font-medium">全局音效总开关</span>
          <input
            v-model="localGlobalSettingsRef.soundEnabled"
            type="checkbox"
            class="w-5 h-5 text-green-600 rounded focus:ring-green-500"
          />
        </label>
        <label class="flex items-center justify-between">
          <span class="text-sm font-medium">五子棋音效</span>
          <input
            v-model="gameSettings.enableSound"
            type="checkbox"
            :disabled="!localGlobalSettingsRef.soundEnabled"
            class="w-5 h-5 text-green-600 rounded focus:ring-green-500 disabled:opacity-50"
          />
        </label>
        <label class="flex items-center justify-between">
          <span class="text-sm font-medium">全局语音播报</span>
          <input
            v-model="localGlobalSettingsRef.voiceEnabled"
            type="checkbox"
            :disabled="!localGlobalSettingsRef.soundEnabled"
            class="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </label>
        <p class="text-xs text-gray-500">
          全局开关控制所有游戏的音效，关闭后各游戏的音效也会被禁用
        </p>
      </div>
    </div>

    <!-- 按钮组已由 SettingsDialog 处理 -->
  </SettingsDialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
// @ts-ignore
import { useStore } from 'vuex'
import SettingsDialog from '../SettingsDialog.vue'

// SettingsDialog 组件引用
const settingsDialogRef = ref<InstanceType<typeof SettingsDialog> | null>(null)

// 用于跟踪是否需要在保存后跳转到AI设置
const pendingAISettingsOpen = ref(false)

const store = useStore()
const show = computed({
  get: () => store.state.gomoku.ui.showGameSettings,
  set: (value) => store.commit('setShowGameSettings', value),
})
const aiThinking = computed(() => store.state.gomoku.gameState.aiThinking)
const isGameInProgress = computed(
  () => store.state.gomoku.gameState.moveCount > 0 && !store.state.gomoku.gameState.gameOver,
)

// 本地副本
const localGameMode = ref(store.state.gomoku.gameMode)
const localAiPlayer = ref(store.state.gomoku.aiPlayer)
const localGameSettings = ref({ ...store.state.gomoku.gameSettings })
const localAiVsAiSettings = ref({ ...store.state.gomoku.aiVsAiSettings })
const localGlobalSettings = ref({ ...store.state.globalSettings })

watch(show, (val) => {
  if (val) {
    localGameMode.value = store.state.gomoku.gameMode
    localAiPlayer.value = store.state.gomoku.aiPlayer
    localGameSettings.value = { ...store.state.gomoku.gameSettings }
    localAiVsAiSettings.value = { ...store.state.gomoku.aiVsAiSettings }
    localGlobalSettings.value = { ...store.state.globalSettings }
  }
})

const gameMode = computed({
  get: () => localGameMode.value,
  set: (v) => (localGameMode.value = v),
})
const aiPlayer = computed({
  get: () => localAiPlayer.value,
  set: (v) => (localAiPlayer.value = v),
})
const gameSettings = computed({
  get: () => localGameSettings.value,
  set: (v) => (localGameSettings.value = v),
})
const aiVsAiSettings = computed({
  get: () => localAiVsAiSettings.value,
  set: (v) => (localAiVsAiSettings.value = v),
})

const localGlobalSettingsRef = computed({
  get: () => localGlobalSettings.value,
  set: (v) => (localGlobalSettings.value = v),
})

// 当音效关闭时，自动关闭语音
watch(
  () => localGlobalSettings.value.soundEnabled,
  (newVal) => {
    if (!newVal) {
      localGlobalSettings.value.voiceEnabled = false
      localGameSettings.value.enableSound = false
    }
  },
)

// 原始数据（用于变更检测）
const originalData = computed(() => ({
  gameMode: store.state.gomoku.gameMode,
  aiPlayer: store.state.gomoku.aiPlayer,
  gameSettings: store.state.gomoku.gameSettings,
  aiVsAiSettings: store.state.gomoku.aiVsAiSettings,
  globalSettings: store.state.globalSettings,
}))

// 当前数据（用于变更检测）
const currentData = computed(() => ({
  gameMode: localGameMode.value,
  aiPlayer: localAiPlayer.value,
  gameSettings: localGameSettings.value,
  aiVsAiSettings: localAiVsAiSettings.value,
  globalSettings: localGlobalSettings.value,
}))

function handleApply() {
  store.commit('updateGameMode', gameMode.value)
  store.commit('updateAiPlayer', aiPlayer.value)
  store.commit('updateGameSettings', { ...gameSettings.value })
  store.commit('updateAiVsAiSettings', { ...aiVsAiSettings.value })
  store.commit('updateGlobalSettings', { ...localGlobalSettings.value })

  // 如果有待处理的AI设置打开请求，则在保存后打开AI设置
  if (pendingAISettingsOpen.value) {
    pendingAISettingsOpen.value = false
    store.commit('setShowAISettings', true)
  }

  store.commit('setShowGameSettings', false)
}

function handleCancel() {
  // 重置本地状态到原始值
  localGameMode.value = store.state.gomoku.gameMode
  localAiPlayer.value = store.state.gomoku.aiPlayer
  localGameSettings.value = { ...store.state.gomoku.gameSettings }
  localAiVsAiSettings.value = { ...store.state.gomoku.aiVsAiSettings }
  localGlobalSettings.value = { ...store.state.globalSettings }

  // 检查是否有待处理的AI设置打开请求
  const shouldOpenAISettings = pendingAISettingsOpen.value

  // 重置待处理的AI设置打开标记
  pendingAISettingsOpen.value = false

  // 如果有待处理的AI设置请求，在取消后也要打开AI设置
  if (shouldOpenAISettings) {
    // 需要延迟执行，让当前对话框先关闭
    setTimeout(() => {
      store.commit('setShowAISettings', true)
    }, 0)
  }
}

function handleClose() {
  store.commit('setShowGameSettings', false)
}

function handleOpenAISettings() {
  // 使用 SettingsDialog 的 tryClose 方法，它会自动判断是否需要显示确认窗口
  if (settingsDialogRef.value) {
    const showedConfirm = settingsDialogRef.value.tryClose()

    if (showedConfirm) {
      // 如果显示了确认窗口，设置标记，在用户选择保存后会自动打开AI设置
      pendingAISettingsOpen.value = true
    } else {
      // 如果没有显示确认窗口，说明没有未保存的更改，直接跳转到 AI 设置
      store.commit('setShowAISettings', true)
      store.commit('setShowGameSettings', false)
    }
  }
}

function handleSwitchMode(mode: string) {
  gameMode.value = mode
}
</script>

<style scoped>
/* GameSettings 特定样式 */
</style>
