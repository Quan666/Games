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
        <h3 class="text-xl font-bold text-gray-800 flex items-center">⚙️ 全局设置</h3>
        <button
          @click="handleClose"
          class="ml-2 w-9 h-9 flex items-center justify-center rounded-full text-gray-400 hover:text-red-500 hover:bg-gray-100 transition-colors text-2xl font-bold focus:outline-none"
          aria-label="关闭"
        >
          ×
        </button>
      </div>
      <div class="p-6 pt-4">
        <!-- 音效设置 -->
        <div class="space-y-4 mb-6">
          <h4 class="font-semibold text-gray-700 border-b pb-1">🔊 音效设置</h4>
          <div class="space-y-3">
            <label class="flex items-center justify-between">
              <span class="text-sm font-medium">全局音效总开关</span>
              <input
                v-model="globalSettings.soundEnabled"
                type="checkbox"
                class="w-5 h-5 text-green-600 rounded focus:ring-green-500"
              />
            </label>
            <label class="flex items-center justify-between">
              <span class="text-sm font-medium">全局语音播报</span>
              <input
                v-model="globalSettings.voiceEnabled"
                type="checkbox"
                :disabled="!globalSettings.soundEnabled"
                class="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </label>
            <p class="text-xs text-gray-500">
              全局开关控制所有游戏的音效和语音，关闭音效后语音也会被禁用
            </p>
          </div>
        </div>

        <!-- 主题设置 -->
        <div class="space-y-4 mb-6">
          <h4 class="font-semibold text-gray-700 border-b pb-1">🎨 主题设置</h4>
          <div class="space-y-3">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">主题</label>
              <select
                v-model="globalSettings.theme"
                class="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="light">浅色主题</option>
                <option value="dark">深色主题</option>
                <option value="auto">跟随系统</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">语言</label>
              <select
                v-model="globalSettings.language"
                class="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="zh-CN">简体中文</option>
                <option value="zh-TW">繁体中文</option>
                <option value="en-US">English</option>
              </select>
            </div>
          </div>
        </div>

        <!-- 游戏设置 -->
        <div class="space-y-4 mb-6">
          <h4 class="font-semibold text-gray-700 border-b pb-1">🎮 游戏设置</h4>
          <div class="space-y-3">
            <div class="bg-gray-50 rounded-lg p-3">
              <h5 class="text-sm font-semibold text-gray-700 mb-2">五子棋</h5>
              <label class="flex items-center justify-between">
                <span class="text-xs text-gray-600">音效</span>
                <input
                  v-model="gomokuSettings.enableSound"
                  type="checkbox"
                  :disabled="!globalSettings.soundEnabled"
                  class="w-4 h-4 text-green-600 rounded focus:ring-green-500 disabled:opacity-50"
                />
              </label>
            </div>
            <div class="bg-gray-50 rounded-lg p-3">
              <h5 class="text-sm font-semibold text-gray-700 mb-2">中国象棋</h5>
              <div class="space-y-2">
                <label class="flex items-center justify-between">
                  <span class="text-xs text-gray-600">音效</span>
                  <input
                    v-model="chessSettings.soundEnabled"
                    type="checkbox"
                    :disabled="!globalSettings.soundEnabled"
                    class="w-4 h-4 text-green-600 rounded focus:ring-green-500 disabled:opacity-50"
                  />
                </label>
                <label class="flex items-center justify-between">
                  <span class="text-xs text-gray-600">语音播报</span>
                  <input
                    v-model="chessSettings.voiceEnabled"
                    type="checkbox"
                    :disabled="
                      !globalSettings.soundEnabled ||
                      !globalSettings.voiceEnabled ||
                      !chessSettings.soundEnabled
                    "
                    class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </label>
                <label class="flex items-center justify-between">
                  <span class="text-xs text-gray-600">自动保存</span>
                  <input
                    v-model="chessSettings.autoSave"
                    type="checkbox"
                    class="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- 按钮组 -->
        <div class="flex gap-3">
          <button
            @click="resetToDefaults"
            class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            重置默认
          </button>
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
            应用设置
          </button>
        </div>
      </div>
    </div>

    <!-- 确认保存弹窗 -->
    <ConfirmDialog :show="showConfirm" @confirm="onConfirmSave" @cancel="onCancelSave">
      <template #title>设置未保存</template>
      设置已更改，是否保存？
    </ConfirmDialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
// @ts-ignore
import { useStore } from 'vuex'
import ConfirmDialog from './gomoku/ConfirmDialog.vue'

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const store = useStore()

// 本地副本
const localGlobalSettings = ref({ ...store.state.globalSettings })
const localGomokuSettings = ref({ ...store.state.gomoku.gameSettings })
const localChessSettings = ref({ ...store.state.chess.gameSettings })

// 弹窗每次打开时重置本地副本
watch(
  () => props.show,
  (val) => {
    if (val) {
      localGlobalSettings.value = { ...store.state.globalSettings }
      localGomokuSettings.value = { ...store.state.gomoku.gameSettings }
      localChessSettings.value = { ...store.state.chess.gameSettings }
    }
  },
)

// 当音效关闭时，自动关闭语音和各游戏的音效
watch(
  () => localGlobalSettings.value.soundEnabled,
  (newVal) => {
    if (!newVal) {
      localGlobalSettings.value.voiceEnabled = false
      localGomokuSettings.value.enableSound = false
      localChessSettings.value.soundEnabled = false
      localChessSettings.value.voiceEnabled = false
    }
  },
)

// 当象棋音效关闭时，自动关闭象棋语音
watch(
  () => localChessSettings.value.soundEnabled,
  (newVal) => {
    if (!newVal) {
      localChessSettings.value.voiceEnabled = false
    }
  },
)

// v-model 绑定本地副本
const globalSettings = computed({
  get: () => localGlobalSettings.value,
  set: (value) => {
    localGlobalSettings.value = { ...localGlobalSettings.value, ...value }
  },
})

const gomokuSettings = computed({
  get: () => localGomokuSettings.value,
  set: (value) => {
    localGomokuSettings.value = { ...localGomokuSettings.value, ...value }
  },
})

const chessSettings = computed({
  get: () => localChessSettings.value,
  set: (value) => {
    localChessSettings.value = { ...localChessSettings.value, ...value }
  },
})

// 检查是否有变化
function isDirty() {
  const global = store.state.globalSettings
  const gomoku = store.state.gomoku.gameSettings
  const chess = store.state.chess.gameSettings

  return (
    JSON.stringify(localGlobalSettings.value) !== JSON.stringify(global) ||
    JSON.stringify(localGomokuSettings.value) !== JSON.stringify(gomoku) ||
    JSON.stringify(localChessSettings.value) !== JSON.stringify(chess)
  )
}

// 应用设置
function handleApply() {
  store.commit('updateGlobalSettings', { ...localGlobalSettings.value })
  store.commit('updateGameSettings', { ...localGomokuSettings.value })
  store.commit('updateChessSettings', { ...localChessSettings.value })
  emit('close')
}

// 确认对话框逻辑
const showConfirm = ref(false)
let pendingAction: null | (() => void) = null

function onConfirmSave() {
  handleApply()
  showConfirm.value = false
  pendingAction && pendingAction()
  pendingAction = null
}

function onCancelSave() {
  showConfirm.value = false
  pendingAction && pendingAction()
  pendingAction = null
}

function handleClose() {
  if (isDirty()) {
    showConfirm.value = true
    pendingAction = () => emit('close')
    return
  }
  emit('close')
}

// 重置为默认设置
function resetToDefaults() {
  localGlobalSettings.value = {
    soundEnabled: true,
    voiceEnabled: true,
    theme: 'light',
    language: 'zh-CN',
  }

  localGomokuSettings.value = {
    ...localGomokuSettings.value,
    enableSound: true,
  }

  localChessSettings.value = {
    ...localChessSettings.value,
    soundEnabled: true,
    voiceEnabled: true,
    showMoveHistory: true,
    autoSave: true,
    animationSpeed: 'normal',
  }
}
</script>

<style scoped>
.hide-scrollbar {
  scrollbar-width: none; /* Firefox */
}

.hide-scrollbar::-webkit-scrollbar {
  display: none; /* Chrome/Safari/Webkit */
}
</style>
