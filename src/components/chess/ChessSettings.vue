<template>
  <SettingsDialog
    v-model="show"
    title="🎮 象棋设置"
    width="1400px"
    max-width="90vw"
    :apply-callback="handleApply"
    :cancel-callback="handleCancel"
    :old-data="originalData"
    :new-data="currentData"
  >
    <!-- 游戏模式 -->
    <div class="space-y-4 mb-6">
      <h4 class="font-semibold text-gray-700 border-b pb-1">🕹️ 游戏模式</h4>
      <div class="grid grid-cols-3 gap-2">
        <button
          @click="localSettings.gameMode = 'pvp'"
          :class="
            localSettings.gameMode === 'pvp'
              ? 'bg-green-500 text-white'
              : 'bg-gray-200 text-gray-700'
          "
          class="w-full py-3 rounded-lg font-semibold transition-all duration-200 text-sm"
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
          class="w-full py-3 rounded-lg font-semibold transition-all duration-200 text-sm"
        >
          🤖 人机对战
        </button>
        <button
          @click="localSettings.gameMode = 'ai-vs-ai'"
          :class="
            localSettings.gameMode === 'ai-vs-ai'
              ? 'bg-purple-500 text-white'
              : 'bg-gray-200 text-gray-700'
          "
          class="w-full py-3 rounded-lg font-semibold transition-all duration-200 text-sm"
        >
          🎯 AI对战
        </button>
      </div>
    </div>

    <!-- 玩家执棋选择 (仅在人机对战模式下显示) -->
    <div v-if="localSettings.gameMode === 'pve'" class="space-y-4 mb-6">
      <h4 class="font-semibold text-gray-700 border-b pb-1">♟️ 玩家执棋</h4>
      <div class="grid grid-cols-2 gap-3">
        <button
          @click="localSettings.playerCamp = 'red'"
          :class="
            localSettings.playerCamp === 'red'
              ? 'bg-red-500 text-white'
              : 'bg-gray-200 text-gray-700'
          "
          class="w-full py-3 rounded-lg font-semibold transition-all duration-200"
        >
          🔴 红方 (先手)
        </button>
        <button
          @click="localSettings.playerCamp = 'black'"
          :class="
            localSettings.playerCamp === 'black'
              ? 'bg-gray-800 text-white'
              : 'bg-gray-200 text-gray-700'
          "
          class="w-full py-3 rounded-lg font-semibold transition-all duration-200"
        >
          ⚫ 黑方 (后手)
        </button>
      </div>
    </div>

    <!-- AI棋力设置 (仅在人机对战模式下显示) -->
    <div v-if="localSettings.gameMode === 'pve'" class="space-y-4 mb-6">
      <h4 class="font-semibold text-gray-700 border-b pb-1">🤖 AI棋力设置</h4>

      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div class="space-y-3">
          <div>
            <label class="block text-sm font-medium text-blue-700 mb-2">
              AI棋力水平: {{ localAiConfig.skillLevel }}
            </label>
            <input
              v-model.number="localAiConfig.skillLevel"
              type="range"
              min="0"
              max="20"
              step="1"
              class="w-full"
            />
            <div class="flex justify-between text-xs text-blue-600 mt-1">
              <span>0 (最弱)</span>
              <span>20 (最强)</span>
            </div>
            <p class="text-xs text-blue-600 mt-1">控制AI的棋力强度，数值越高棋力越强</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-blue-700 mb-2">
              AI思考时间: {{ localAiConfig.thinkingTime }}秒
            </label>
            <input
              v-model.number="localAiConfig.thinkingTime"
              type="range"
              min="1"
              max="30"
              step="1"
              class="w-full"
            />
            <div class="flex justify-between text-xs text-blue-600 mt-1">
              <span>1秒 (快)</span>
              <span>30秒 (慢)</span>
            </div>
            <p class="text-xs text-blue-600 mt-1">AI每步棋的思考时间</p>
          </div>

          <!-- 等级制限制选项 -->
          <div class="pt-2">
            <label class="flex items-center gap-2">
              <input type="checkbox" v-model="localAiConfig.limitStrength" class="rounded" />
              <span class="text-sm font-medium text-blue-700">启用等级制限制</span>
            </label>
            <p class="text-xs text-blue-600 mt-1">开启后可设置具体的ELO等级</p>
          </div>

          <!-- UCI Elo设置 (当启用等级制限制时) -->
          <div v-if="localAiConfig.limitStrength" class="pt-2">
            <label class="block text-sm font-medium text-blue-700 mb-2">
              ELO等级: {{ localAiConfig.uciElo }}
            </label>
            <input
              v-model.number="localAiConfig.uciElo"
              type="range"
              min="1280"
              max="3133"
              step="50"
              class="w-full"
            />
            <div class="flex justify-between text-xs text-blue-600 mt-1">
              <span>1280 (初学者)</span>
              <span>3133 (大师级)</span>
            </div>
            <p class="text-xs text-blue-600 mt-1">AI的具体ELO棋力等级</p>
          </div>
        </div>
      </div>
    </div>

    <!-- AI对战AI设置 (仅在AI对战模式下显示) -->
    <div v-if="localSettings.gameMode === 'ai-vs-ai'" class="space-y-4 mb-6">
      <h4 class="font-semibold text-gray-700 border-b pb-1">🤖 AI对战设置</h4>

      <!-- 红方AI设置 -->
      <div class="bg-red-50 border border-red-200 rounded-lg p-4">
        <h5 class="font-medium text-red-800 mb-3 flex items-center">🔴 红方AI (先手)</h5>
        <div class="space-y-3">
          <div>
            <label class="block text-sm font-medium text-red-700 mb-2">
              棋力水平: {{ localAiVsAiConfig.redAI.skillLevel }}
            </label>
            <input
              v-model.number="localAiVsAiConfig.redAI.skillLevel"
              type="range"
              min="0"
              max="20"
              step="1"
              class="w-full"
            />
            <div class="flex justify-between text-xs text-red-600 mt-1">
              <span>0 (最弱)</span>
              <span>20 (最强)</span>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-red-700 mb-2">
              思考时间: {{ localAiVsAiConfig.redAI.thinkingTime }}秒
            </label>
            <input
              v-model.number="localAiVsAiConfig.redAI.thinkingTime"
              type="range"
              min="1"
              max="30"
              step="1"
              class="w-full"
            />
            <div class="flex justify-between text-xs text-red-600 mt-1">
              <span>1秒</span>
              <span>30秒</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 黑方AI设置 -->
      <div class="bg-gray-50 border border-gray-300 rounded-lg p-4">
        <h5 class="font-medium text-gray-800 mb-3 flex items-center">⚫ 黑方AI (后手)</h5>
        <div class="space-y-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              棋力水平: {{ localAiVsAiConfig.blackAI.skillLevel }}
            </label>
            <input
              v-model.number="localAiVsAiConfig.blackAI.skillLevel"
              type="range"
              min="0"
              max="20"
              step="1"
              class="w-full"
            />
            <div class="flex justify-between text-xs text-gray-600 mt-1">
              <span>0 (最弱)</span>
              <span>20 (最强)</span>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              思考时间: {{ localAiVsAiConfig.blackAI.thinkingTime }}秒
            </label>
            <input
              v-model.number="localAiVsAiConfig.blackAI.thinkingTime"
              type="range"
              min="1"
              max="30"
              step="1"
              class="w-full"
            />
            <div class="flex justify-between text-xs text-gray-600 mt-1">
              <span>1秒</span>
              <span>30秒</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 对战速度设置 -->
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h5 class="font-medium text-blue-800 mb-3">⚡ 对战速度</h5>
        <div>
          <label class="block text-sm font-medium text-blue-700 mb-2">
            AI下棋间隔: {{ localAiVsAiConfig.gameSpeed / 1000 }}秒
          </label>
          <input
            v-model.number="localAiVsAiConfig.gameSpeed"
            type="range"
            min="500"
            max="5000"
            step="500"
            class="w-full"
          />
          <div class="flex justify-between text-xs text-blue-600 mt-1">
            <span>0.5秒 (快)</span>
            <span>5秒 (慢)</span>
          </div>
          <p class="text-xs text-blue-600 mt-1">控制AI之间下棋的间隔时间</p>
        </div>
      </div>
    </div>

    <!-- 显示设置 -->
    <div class="space-y-4 mb-6">
      <h4 class="font-semibold text-gray-700 border-b pb-1">📺 显示设置</h4>
      <div class="space-y-3">
        <label class="flex items-center justify-between">
          <span class="text-sm font-medium">显示棋盘坐标</span>
          <div class="relative">
            <input v-model="localSettings.showCoordinates" type="checkbox" class="sr-only peer" />
            <div
              class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"
            ></div>
          </div>
        </label>
        <label class="flex items-center justify-between">
          <span class="text-sm font-medium">显示走法记录</span>
          <div class="relative">
            <input v-model="localSettings.showMoveHistory" type="checkbox" class="sr-only peer" />
            <div
              class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"
            ></div>
          </div>
        </label>
        <p class="text-xs text-gray-500">显示ICCS格式的棋盘坐标和走法历史记录</p>
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
              :disabled="
                !localGlobalSettings.soundEnabled ||
                !localGlobalSettings.voiceEnabled ||
                !localSettings.enableSound
              "
              class="sr-only peer disabled:cursor-not-allowed"
            />
            <div
              :class="
                !localGlobalSettings.soundEnabled ||
                !localGlobalSettings.voiceEnabled ||
                !localSettings.enableSound
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              "
              class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"
            ></div>
          </div>
        </label>

        <p class="text-xs text-gray-500">
          全局开关控制所有游戏的音效，关闭后各游戏的音效和语音也会被禁用。象棋语音播报需要同时开启全局音效、全局语音播报和象棋音效。
        </p>
      </div>
    </div>

    <!-- 按钮组已移至 SettingsDialog 组件内部 -->
  </SettingsDialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
// @ts-ignore
import { useStore } from 'vuex'
import SettingsDialog from '../SettingsDialog.vue'

interface ChessSettings {
  gameMode: 'pvp' | 'pve' | 'ai-vs-ai'
  playerCamp?: 'red' | 'black'
  showCoordinates: boolean
  showMoveHistory: boolean
  enableSound: boolean
  enableVoice: boolean
}

interface AIConfig {
  engine: string
  difficulty: string
  thinkingTime: number
  depth: number
  threads: number
  hashSize: number
  skillLevel: number
  multiPV: number
  moveOverhead: number
  repetitionRule: string
  drawRule: string
  sixtyMoveRule: boolean
  maxCheckCount: number
  limitStrength: boolean
  uciElo: number
  ponder: boolean
}

interface AIVsAIConfig {
  redAI: AIConfig
  blackAI: AIConfig
  gameSpeed: number
}

interface GlobalSettings {
  soundEnabled: boolean
  voiceEnabled: boolean
}

interface Props {
  show: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:show': [value: boolean]
  'apply-settings': [
    settings: ChessSettings,
    globalSettings: GlobalSettings,
    aiVsAiConfig?: AIVsAIConfig,
    aiConfig?: AIConfig,
  ]
  'open-move-history': []
}>()

// 创建双向绑定的 show 计算属性
const show = computed({
  get: () => props.show,
  set: (value: boolean) => emit('update:show', value),
})

const store = useStore()

// 本地临时设置 - 使用响应式 ref
const localSettings = ref<ChessSettings>({
  gameMode: 'pvp',
  showCoordinates: true,
  showMoveHistory: true,
  enableSound: true,
  enableVoice: true,
})
const localGlobalSettings = ref<GlobalSettings>({
  soundEnabled: true,
  voiceEnabled: true,
})
const localAiVsAiConfig = ref<AIVsAIConfig>({} as AIVsAIConfig)
const localAiConfig = ref<AIConfig>({} as AIConfig)

// 获取当前设置的响应式计算属性
const currentSettings = computed(
  () =>
    store.state.chess?.settings || {
      gameMode: 'pvp',
      playerCamp: 'red',
      showCoordinates: true,
      showMoveHistory: false,
      enableSound: true,
      enableVoice: false,
    },
)

const currentGlobalSettings = computed(
  () =>
    store.state.globalSettings || {
      soundEnabled: true,
      voiceEnabled: false,
    },
)

// 获取当前AI对战AI配置
const currentAiVsAiConfig = computed(() => {
  const defaultConfig = {
    redAI: {
      engine: 'pikafish',
      difficulty: 'medium',
      thinkingTime: 5,
      depth: 8,
      threads: 1,
      hashSize: 16,
      skillLevel: 18,
      multiPV: 1,
      moveOverhead: 10,
      repetitionRule: 'AsianRule',
      drawRule: 'None',
      sixtyMoveRule: true,
      maxCheckCount: 0,
      limitStrength: false,
      uciElo: 1280,
      ponder: false,
    },
    blackAI: {
      engine: 'pikafish',
      difficulty: 'medium',
      thinkingTime: 5,
      depth: 8,
      threads: 1,
      hashSize: 16,
      skillLevel: 16,
      multiPV: 1,
      moveOverhead: 10,
      repetitionRule: 'AsianRule',
      drawRule: 'None',
      sixtyMoveRule: true,
      maxCheckCount: 0,
      limitStrength: false,
      uciElo: 1280,
      ponder: false,
    },
    gameSpeed: 2000,
  }

  return store.state.chess?.gameConfig?.aiVsAiConfig || defaultConfig
})

// 获取当前AI配置（人机模式）
const currentAiConfig = computed(() => {
  const defaultConfig = {
    engine: 'pikafish',
    difficulty: 'medium',
    thinkingTime: 5,
    depth: 8,
    threads: 1,
    hashSize: 16,
    skillLevel: 20,
    multiPV: 1,
    moveOverhead: 10,
    repetitionRule: 'AsianRule',
    drawRule: 'None',
    sixtyMoveRule: true,
    maxCheckCount: 0,
    limitStrength: false,
    uciElo: 1280,
    ponder: false,
  }

  return store.state.chess?.gameConfig?.aiConfig || defaultConfig
})

// 原始数据（用于对比）
const originalData = computed(() => ({
  settings: currentSettings.value,
  globalSettings: currentGlobalSettings.value,
  aiVsAiConfig: currentAiVsAiConfig.value,
  aiConfig: currentAiConfig.value,
}))

// 当前数据（用于对比）
const currentData = computed(() => ({
  settings: localSettings.value,
  globalSettings: localGlobalSettings.value,
  aiVsAiConfig: localAiVsAiConfig.value,
  aiConfig: localAiConfig.value,
}))

// 重置本地设置到当前存储状态
const resetLocalSettings = () => {
  localSettings.value = { ...currentSettings.value }
  localGlobalSettings.value = { ...currentGlobalSettings.value }
  // 深拷贝AI对AI配置，确保修改不会影响store中的原始数据
  localAiVsAiConfig.value = JSON.parse(JSON.stringify(currentAiVsAiConfig.value))
  localAiConfig.value = { ...currentAiConfig.value }
}

// 初始化本地设置
resetLocalSettings()

// 监听弹窗显示状态，每次打开时重新同步最新的 store 状态
watch(
  () => props.show,
  (newShow) => {
    if (newShow) {
      // 弹窗打开时，重新同步最新的 store 状态
      resetLocalSettings()
    }
  },
)

// 监听全局音效开关，关闭时自动关闭所有音效和语音播报
watch(
  () => localGlobalSettings.value.soundEnabled,
  (newSoundEnabled) => {
    if (!newSoundEnabled) {
      // 全局音效关闭时，自动关闭象棋音效、全局语音播报和象棋语音播报
      localSettings.value.enableSound = false
      localGlobalSettings.value.voiceEnabled = false
      localSettings.value.enableVoice = false
    }
  },
)

// 监听全局语音播报开关，关闭时自动关闭象棋语音播报
watch(
  () => localGlobalSettings.value.voiceEnabled,
  (newVoiceEnabled) => {
    if (!newVoiceEnabled) {
      // 全局语音播报关闭时，自动关闭象棋语音播报
      localSettings.value.enableVoice = false
    }
  },
)

// 监听象棋音效开关，关闭时自动关闭象棋语音播报
watch(
  () => localSettings.value.enableSound,
  (newSoundEnabled) => {
    if (!newSoundEnabled) {
      // 象棋音效关闭时，自动关闭象棋语音播报
      localSettings.value.enableVoice = false
    }
  },
)

const handleApply = () => {
  emit(
    'apply-settings',
    localSettings.value,
    localGlobalSettings.value,
    localAiVsAiConfig.value,
    localAiConfig.value,
  )
}

const handleCancel = () => {
  // 重置本地设置
  resetLocalSettings()
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
