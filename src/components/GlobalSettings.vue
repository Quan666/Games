<template>
  <SettingsDialog
    v-model="show"
    title="⚙️ 全局设置"
    width="1400px"
    max-width="90vw"
    :apply-callback="handleApply"
    :cancel-callback="handleCancel"
    :reset-callback="resetToDefault"
    :old-data="originalSettings"
    :new-data="localSettings"
  >
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
          </div>
        </div>
      </div>
    </div>
  </SettingsDialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
// @ts-ignore
import { useStore } from 'vuex'
import SettingsDialog from './SettingsDialog.vue'

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  'update:show': [value: boolean]
}>()

// 创建双向绑定的 show 计算属性
const show = computed({
  get: () => props.show,
  set: (value: boolean) => emit('update:show', value),
})

const store = useStore()

// 本地副本
const localGlobalSettings = ref({ ...store.state.globalSettings })
const localGomokuSettings = ref({ ...store.state.gomoku.gameSettings })
const localChessSettings = ref({ ...store.state.chess.gameSettings })

// 原始数据（用于对比）
const originalSettings = computed(() => ({
  globalSettings: store.state.globalSettings,
  gomokuSettings: store.state.gomoku.gameSettings,
  chessSettings: store.state.chess.gameSettings,
}))

// 当前数据（用于对比）
const localSettings = computed(() => ({
  globalSettings: localGlobalSettings.value,
  gomokuSettings: localGomokuSettings.value,
  chessSettings: localChessSettings.value,
}))

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

// 应用设置
function handleApply() {
  store.commit('updateGlobalSettings', { ...localGlobalSettings.value })
  store.commit('updateGameSettings', { ...localGomokuSettings.value })
  store.commit('updateChessSettings', { ...localChessSettings.value })
}

function handleCancel() {
  // 重置本地副本为原始状态
  localGlobalSettings.value = { ...store.state.globalSettings }
  localGomokuSettings.value = { ...store.state.gomoku.gameSettings }
  localChessSettings.value = { ...store.state.chess.gameSettings }
}

// 重置为默认设置
function resetToDefault() {
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
