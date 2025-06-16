<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
  >
    <div
      class="bg-white rounded-xl p-0 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl hide-scrollbar"
    >
      <div
        class="flex items-center justify-between px-6 py-4 border-b-2 border-gray-200 sticky top-0 bg-white z-10"
      >
        <h3 class="text-xl font-bold text-gray-800 flex items-center">🎮 象棋设置</h3>
        <button
          @click="handleClose"
          class="ml-2 w-9 h-9 flex items-center justify-center rounded-full text-gray-400 hover:text-red-500 hover:bg-gray-100 transition-colors text-2xl font-bold focus:outline-none"
          aria-label="关闭"
        >
          ×
        </button>
      </div>
      <div class="p-6 pt-4">
        <!-- 游戏模式 -->
        <div class="space-y-4 mb-6">
          <h4 class="font-semibold text-gray-700 border-b pb-1">🕹️ 游戏模式</h4>
          <div class="grid grid-cols-2 gap-3">
            <button
              @click="localSettings.gameMode = 'pvp'"
              :class="
                localSettings.gameMode === 'pvp'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              "
              class="w-full py-3 rounded-lg font-semibold transition-all duration-200"
            >
              🎮 双人对战
            </button>
            <button
              @click="localSettings.gameMode = 'pve'"
              :class="
                localSettings.gameMode === 'pve'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              "
              class="w-full py-3 rounded-lg font-semibold transition-all duration-200"
            >
              🤖 人机对战
            </button>
          </div>
        </div>

        <!-- 显示设置 -->
        <div class="space-y-4 mb-6">
          <h4 class="font-semibold text-gray-700 border-b pb-1">📺 显示设置</h4>
          <div class="space-y-3">
            <label class="flex items-center justify-between">
              <span class="text-sm font-medium">显示棋盘坐标</span>
              <div class="relative">
                <input
                  v-model="localSettings.showCoordinates"
                  type="checkbox"
                  class="sr-only peer"
                />
                <div
                  class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"
                ></div>
              </div>
            </label>
            <label class="flex items-center justify-between">
              <span class="text-sm font-medium">显示走法记录</span>
              <div class="relative">
                <input
                  v-model="localSettings.showMoveHistory"
                  @change="handleMoveHistoryToggle"
                  type="checkbox"
                  class="sr-only peer"
                />
                <div
                  class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"
                ></div>
              </div>
            </label>
            <p class="text-xs text-gray-500">显示ICCS格式的棋盘坐标和走法历史记录</p>
          </div>
        </div>

        <!-- 游戏设置 -->
        <div class="space-y-4 mb-6">
          <h4 class="font-semibold text-gray-700 border-b pb-1">💾 游戏设置</h4>
          <div class="space-y-3">
            <label class="flex items-center justify-between">
              <span class="text-sm font-medium">自动保存游戏</span>
              <div class="relative">
                <input v-model="localSettings.autoSave" type="checkbox" class="sr-only peer" />
                <div
                  class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"
                ></div>
              </div>
            </label>
            <p class="text-xs text-gray-500">开启后，游戏状态会自动保存，刷新页面后可以继续游戏</p>
          </div>
        </div>

        <!-- 音效设置 -->
        <div class="space-y-4 mb-6">
          <h4 class="font-semibold text-gray-700 border-b pb-1">🔊 音效设置</h4>
          <div class="space-y-3">
            <label class="flex items-center justify-between">
              <span class="text-sm font-medium">全局音效总开关</span>
              <div class="relative">
                <input
                  v-model="localGlobalSettings.soundEnabled"
                  type="checkbox"
                  class="sr-only peer"
                />
                <div
                  class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"
                ></div>
              </div>
            </label>
            <label class="flex items-center justify-between">
              <span class="text-sm font-medium">全局语音播报</span>
              <div class="relative">
                <input
                  v-model="localGlobalSettings.voiceEnabled"
                  type="checkbox"
                  :disabled="!localGlobalSettings.soundEnabled"
                  class="sr-only peer disabled:cursor-not-allowed"
                />
                <div
                  :class="!localGlobalSettings.soundEnabled ? 'opacity-50 cursor-not-allowed' : ''"
                  class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"
                ></div>
              </div>
            </label>
            <label class="flex items-center justify-between">
              <span class="text-sm font-medium">象棋音效</span>
              <div class="relative">
                <input
                  v-model="localSettings.enableSound"
                  type="checkbox"
                  :disabled="!localGlobalSettings.soundEnabled"
                  class="sr-only peer disabled:cursor-not-allowed"
                />
                <div
                  :class="!localGlobalSettings.soundEnabled ? 'opacity-50 cursor-not-allowed' : ''"
                  class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"
                ></div>
              </div>
            </label>
            <label class="flex items-center justify-between">
              <span class="text-sm font-medium">象棋语音播报</span>
              <div class="relative">
                <input
                  v-model="localSettings.enableVoice"
                  type="checkbox"
                  :disabled="!localGlobalSettings.soundEnabled || !localGlobalSettings.voiceEnabled"
                  class="sr-only peer disabled:cursor-not-allowed"
                />
                <div
                  :class="
                    !localGlobalSettings.soundEnabled || !localGlobalSettings.voiceEnabled
                      ? 'opacity-50 cursor-not-allowed'
                      : ''
                  "
                  class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"
                ></div>
              </div>
            </label>

            <p class="text-xs text-gray-500">
              全局开关控制所有游戏的音效，关闭后各游戏的音效也会被禁用。象棋语音播报需要同时开启全局音效和全局语音播报。
            </p>
          </div>
        </div>

        <!-- 按钮组 -->
        <div class="flex gap-3">
          <button
            @click="handleClose"
            class="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            取消
          </button>
          <button
            @click="handleApply"
            class="flex-1 py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            应用
          </button>
        </div>
      </div>
    </div>

    <!-- 确认弹窗 -->
    <ConfirmDialog
      :show="showConfirm"
      title="保存设置"
      message="设置已修改，是否保存更改？"
      confirm-text="保存"
      cancel-text="不保存"
      @confirm="handleConfirmSave"
      @cancel="handleCancelSave"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
// @ts-ignore
import { useStore } from 'vuex'
import ConfirmDialog from '../ConfirmDialog.vue'

interface ChessSettings {
  gameMode: 'pvp' | 'pve'
  showCoordinates: boolean
  showMoveHistory: boolean
  enableSound: boolean
  enableVoice: boolean
  autoSave: boolean
}

interface GlobalSettings {
  soundEnabled: boolean
  voiceEnabled: boolean
}

interface Props {
  show: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  close: []
  'apply-settings': [settings: ChessSettings, globalSettings: GlobalSettings]
  'open-move-history': []
}>()

const store = useStore()

// 确认弹窗状态
const showConfirm = ref(false)

// 获取当前设置
const currentSettings = computed(
  () =>
    store.state.chess?.settings || {
      gameMode: 'pvp',
      showCoordinates: true,
      showMoveHistory: false,
      enableSound: true,
      enableVoice: false,
      autoSave: true,
    },
)

const currentGlobalSettings = computed(
  () =>
    store.state.globalSettings || {
      soundEnabled: true,
      voiceEnabled: false,
    },
)

// 本地临时设置
const localSettings = ref<ChessSettings>({ ...currentSettings.value })
const localGlobalSettings = ref<GlobalSettings>({ ...currentGlobalSettings.value })

// 设置是否有变更
const hasChanges = computed(() => {
  return (
    JSON.stringify(localSettings.value) !== JSON.stringify(currentSettings.value) ||
    JSON.stringify(localGlobalSettings.value) !== JSON.stringify(currentGlobalSettings.value)
  )
})

// 监听props变化，重置本地设置
watch(
  () => currentSettings.value,
  (newVal) => {
    localSettings.value = { ...newVal }
  },
  { deep: true },
)

watch(
  () => currentGlobalSettings.value,
  (newVal) => {
    localGlobalSettings.value = { ...newVal }
  },
  { deep: true },
)

// 处理走法记录开关变化
const handleMoveHistoryToggle = () => {
  if (localSettings.value.showMoveHistory) {
    // 如果开启走法记录，立即打开走法记录弹窗
    emit('open-move-history')
  }
}

const handleClose = () => {
  if (hasChanges.value) {
    showConfirm.value = true
  } else {
    emit('close')
  }
}

const handleConfirmSave = () => {
  showConfirm.value = false
  handleApply()
}

const handleCancelSave = () => {
  showConfirm.value = false
  // 重置本地设置
  localSettings.value = { ...currentSettings.value }
  localGlobalSettings.value = { ...currentGlobalSettings.value }
  emit('close')
}

const handleApply = () => {
  emit('apply-settings', localSettings.value, localGlobalSettings.value)
  emit('close')
}
</script>

<style scoped>
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}

.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
