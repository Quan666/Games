<template>
  <SettingsDialog
    v-model="show"
    title="🐟 象棋AI设置 (Pikafish)"
    max-width="1280px"
    :apply-callback="handleApply"
    :cancel-callback="handleCancel"
    :reset-callback="resetToDefault"
    :old-data="originalConfig"
    :new-data="localConfig"
  >
    <!-- AI状态提示 -->
    <div
      v-if="aiStatus?.thinking"
      class="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
    >
      <div class="flex items-center gap-2 text-yellow-800">
        <div
          class="w-4 h-4 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin"
        ></div>
        <span class="font-medium">⚠️ AI正在思考中</span>
      </div>
      <p class="text-sm text-yellow-700 mt-1">
        配置更改将立即生效，但不会影响当前对局。如果游戏正在进行中，建议等AI完成当前思考后再修改设置。
      </p>
    </div>

    <!-- AI对战模式设置 -->
    <div
      v-if="localConfig.gameMode === 'ai-vs-ai'"
      class="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg"
    >
      <h4 class="font-semibold text-blue-800 mb-3">AI对战模式设置</h4>
      <div class="flex gap-4 mb-4">
        <label class="flex items-center gap-2">
          <input type="radio" v-model="activeAI" value="red" class="accent-red-500" />
          <span class="text-sm font-semibold text-red-600">红方AI设置</span>
        </label>
        <label class="flex items-center gap-2">
          <input type="radio" v-model="activeAI" value="black" class="accent-gray-600" />
          <span class="text-sm font-semibold text-gray-700">黑方AI设置</span>
        </label>
      </div>
      
      <!-- AI对战游戏速度 -->
      <div class="space-y-2">
        <label class="block text-sm font-semibold text-gray-700">
          对战速度: {{ localConfig.aiVsAiConfig?.gameSpeed || 2000 }}ms
        </label>
        <input
          v-model.number="localConfig.aiVsAiConfig!.gameSpeed"
          type="range"
          min="500"
          max="10000"
          step="100"
          class="w-full"
        />
        <div class="flex justify-between text-xs text-gray-500">
          <span>500ms (极快)</span>
          <span>10s (极慢)</span>
        </div>
        <p class="text-xs text-blue-600">AI走棋间隔时间，控制对战节奏</p>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- 棋力设置 (AI特定) -->
      <div class="space-y-4">
        <h4 class="font-semibold text-gray-700 border-b pb-1">
          ⚡ 棋力设置
          <span
            v-if="localConfig.gameMode === 'ai-vs-ai'"
            class="text-sm font-normal"
            :class="activeAI === 'red' ? 'text-red-500' : 'text-gray-600'"
          >
            ({{ activeAI === 'red' ? '红方' : '黑方' }})
          </span>
        </h4>

        <!-- 棋力水平 (Skill Level 0-20) -->
        <div v-if="currentAIConfig">
          <label class="block text-sm font-semibold text-gray-700 mb-2">
            棋力水平: {{ currentAIConfig.skillLevel }}
          </label>
          <input
            v-model.number="currentAIConfig.skillLevel"
            type="range"
            min="0"
            max="20"
            step="1"
            class="w-full"
          />
          <div class="flex justify-between text-xs text-gray-500 mt-1">
            <span>0 (最弱)</span>
            <span>20 (最强)</span>
          </div>
          <p class="text-xs text-gray-500">控制AI的棋力强度，20为最高水平</p>
        </div>

        <!-- 等级制限制 -->
        <div>
          <label class="flex items-center gap-2">
            <input type="checkbox" v-model="currentAIConfig.limitStrength" />
            <span class="text-sm font-semibold text-gray-700">启用等级制限制</span>
          </label>
          <p class="text-xs text-gray-500 mt-1">限制AI到指定ELO等级</p>
        </div>

        <!-- UCI Elo (当启用等级制限制时) -->
        <div v-if="currentAIConfig?.limitStrength">
          <label class="block text-sm font-semibold text-gray-700 mb-2">
            ELO等级: {{ currentAIConfig?.uciElo }}
          </label>
          <input
            v-model.number="currentAIConfig.uciElo"
            type="range"
            min="1280"
            max="3133"
            step="1"
            class="w-full"
          />
          <div class="flex justify-between text-xs text-gray-500 mt-1">
            <span>1280 (初学者)</span>
            <span>3133 (大师)</span>
          </div>
          <p class="text-xs text-gray-500">AI的ELO等级设置</p>
        </div>

        <!-- 思考时间 -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">
            思考时间: {{ currentAIConfig?.thinkingTime || currentAIConfig?.timeLimit }}秒
          </label>
          <input
            v-model.number="currentAIConfig.thinkingTime"
            type="range"
            min="1"
            max="30"
            step="1"
            class="w-full"
          />
          <div class="flex justify-between text-xs text-gray-500 mt-1">
            <span>1秒</span>
            <span>30秒</span>
          </div>
        </div>

        <!-- 搜索深度 -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">
            搜索深度: {{ currentAIConfig?.depth }}
          </label>
          <input
            v-model.number="currentAIConfig.depth"
            type="range"
            min="4"
            max="20"
            step="1"
            class="w-full"
          />
          <div class="flex justify-between text-xs text-gray-500 mt-1">
            <span>4 (快)</span>
            <span>20 (深)</span>
          </div>
          <p class="text-xs text-gray-500">搜索层数，影响棋力和思考时间</p>
        </div>
      </div>

      <!-- 搜索设置 (AI特定) -->
      <div class="space-y-4">
        <h4 class="font-semibold text-gray-700 border-b pb-1">
          🔍 搜索设置
          <span
            v-if="localConfig.gameMode === 'ai-vs-ai'"
            class="text-sm font-normal"
            :class="activeAI === 'red' ? 'text-red-500' : 'text-gray-600'"
          >
            ({{ activeAI === 'red' ? '红方' : '黑方' }})
          </span>
        </h4>

        <!-- MultiPV (多变化分析) -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">
            分析变化数: {{ currentAIConfig?.multiPV }}
          </label>
          <input
            v-model.number="currentAIConfig.multiPV"
            type="range"
            min="1"
            max="10"
            step="1"
            class="w-full"
          />
          <div class="flex justify-between text-xs text-gray-500 mt-1">
            <span>1</span>
            <span>10</span>
          </div>
          <p class="text-xs text-gray-500">同时分析的最佳变化数量</p>
        </div>

        <!-- 后台思考 -->
        <div>
          <label class="flex items-center gap-2">
            <input type="checkbox" v-model="currentAIConfig.ponder" />
            <span class="text-sm font-semibold text-gray-700">启用后台思考</span>
          </label>
          <p class="text-xs text-gray-500 mt-1">对手思考时AI也进行分析</p>
        </div>
      </div>

      <!-- 通用性能设置 -->
      <div class="space-y-4">
        <h4 class="font-semibold text-gray-700 border-b pb-1">⚙️ 性能设置 (通用)</h4>

        <!-- 哈希表大小 -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">哈希表大小</label>
          <select
            v-model.number="localConfig.aiConfig!.hashSize"
            class="w-full p-2 border border-gray-300 rounded-lg text-sm"
          >
            <option :value="1">1 MB</option>
            <option :value="2">2 MB</option>
            <option :value="4">4 MB</option>
            <option :value="8">8 MB</option>
            <option :value="16">16 MB</option>
            <option :value="32">32 MB</option>
            <option :value="64">64 MB</option>
            <option :value="128">128 MB</option>
            <option :value="256">256 MB</option>
            <option :value="512">512 MB</option>
            <option :value="1024">1 GB</option>
            <option :value="2048">2 GB</option>
          </select>
          <p class="text-xs text-gray-500 mt-1">搜索算法使用的内存大小</p>
        </div>

        <!-- 线程数 -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">
            计算线程: {{ localConfig.aiConfig?.threads }}
          </label>
          <input
            v-model.number="localConfig.aiConfig!.threads"
            type="range"
            min="1"
            max="16"
            step="1"
            class="w-full"
          />
          <div class="flex justify-between text-xs text-gray-500 mt-1">
            <span>1</span>
            <span>16</span>
          </div>
          <p class="text-xs text-gray-500">并行计算使用的线程数</p>
        </div>

        <!-- Move Overhead -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">
            移动开销: {{ localConfig.aiConfig?.moveOverhead }}毫秒
          </label>
          <input
            v-model.number="localConfig.aiConfig!.moveOverhead"
            type="range"
            min="0"
            max="1000"
            step="10"
            class="w-full"
          />
          <div class="flex justify-between text-xs text-gray-500 mt-1">
            <span>0ms</span>
            <span>1000ms</span>
          </div>
          <p class="text-xs text-gray-500">GUI延迟补偿时间</p>
        </div>

        <!-- 最大将军次数 -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">
            最大将军次数:
            {{
              (localConfig.aiConfig?.maxCheckCount ?? 0) === 0
                ? '无限制'
                : localConfig.aiConfig?.maxCheckCount
            }}
          </label>
          <input
            v-model.number="localConfig.aiConfig!.maxCheckCount"
            type="range"
            min="0"
            max="100"
            step="1"
            class="w-full"
          />
          <div class="flex justify-between text-xs text-gray-500 mt-1">
            <span>0 (无限制)</span>
            <span>100</span>
          </div>
          <p class="text-xs text-gray-500">限制连续将军次数</p>
        </div>
      </div>

      <!-- 通用规则设置 -->
      <div class="space-y-4">
        <h4 class="font-semibold text-gray-700 border-b pb-1">📋 象棋规则 (通用)</h4>

        <!-- 象棋规则设置 -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">长将/长捉规则</label>
          <select
            v-model="localConfig.aiConfig!.repetitionRule"
            class="w-full p-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="AsianRule">亚洲规则</option>
            <option value="ChineseRule">中国规则</option>
            <option value="ComputerRule">计算机规则</option>
          </select>
          <p class="text-xs text-gray-500 mt-1">处理重复局面的规则</p>
        </div>

        <!-- 和棋规则 -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">和棋规则</label>
          <select
            v-model="localConfig.aiConfig!.drawRule"
            class="w-full p-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="None">无和棋</option>
            <option value="DrawAsBlackWin">和棋算黑胜</option>
            <option value="DrawAsRedWin">和棋算红胜</option>
          </select>
          <p class="text-xs text-gray-500 mt-1">和棋局面的判决规则</p>
        </div>

        <!-- 60回合规则 -->
        <div>
          <label class="flex items-center gap-2">
            <input type="checkbox" v-model="localConfig.aiConfig!.sixtyMoveRule" />
            <span class="text-sm font-semibold text-gray-700">启用60回合规则</span>
          </label>
          <p class="text-xs text-gray-500 mt-1">60回合无吃子判和</p>
        </div>

        <!-- AI vs AI 模式下的快速配置 -->
        <div v-if="localConfig.gameMode === 'ai-vs-ai'">
          <div class="space-y-2 mt-4 pt-3 border-t border-gray-200">
            <h5 class="text-sm font-semibold text-gray-700">快速配置</h5>
            <button
              @click="copyRedToBlack"
              class="w-full px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
            >
              复制红方设置到黑方
            </button>
            <button
              @click="copyBlackToRed"
              class="w-full px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
            >
              复制黑方设置到红方
            </button>
            <button
              @click="randomizeAISettings"
              class="w-full px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
            >
              随机化双方设置
            </button>
            <p class="text-xs text-gray-500">快速配置双方AI差异化设置</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 操作按钮（移至 SettingsDialog 内部） -->
    <div
      v-if="aiStatus?.thinking"
      class="mt-6 pt-4 border-t border-gray-200 flex gap-3 justify-end"
    >
      <button
        @click="stopAI"
        class="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
      >
        停止思考
      </button>
    </div>
  </SettingsDialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { GameConfig } from './ChessGameWrapper'
import type { AIEngineConfig } from './ai'
import SettingsDialog from '../SettingsDialog.vue'

interface Props {
  show: boolean
  config: GameConfig
  aiStatus?: {
    enabled: boolean
    thinking: boolean
    ready: boolean
    status: string
    stats: any
  }
}

interface Emits {
  (e: 'update:show', value: boolean): void
  (e: 'update:config', config: GameConfig): void
  (e: 'stop-ai'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 创建双向绑定的 show 计算属性
const show = computed({
  get: () => props.show,
  set: (value: boolean) => emit('update:show', value),
})

// AI vs AI 模式下的活动AI选择
const activeAI = ref<'red' | 'black'>('red')

// 扩展配置以支持双AI设置 - 与store数据结构保持一致
interface ExtendedGameConfig extends GameConfig {
  aiVsAiConfig?: {
    redAI: AIEngineConfig
    blackAI: AIEngineConfig
    gameSpeed?: number
  }
}

// 创建默认AI配置
const createDefaultAIConfig = () => ({
  // 基础配置
  engine: 'pikafish',
  threads: 1,
  hashSize: 16,
  depth: 8,
  thinkingTime: 5,

  // 棋力相关
  skillLevel: 20,
  limitStrength: false,
  uciElo: 1280,
  ponder: false,

  // Pikafish专用配置
  multiPV: 1,
  moveOverhead: 10,
  repetitionRule: 'AsianRule' as const,
  drawRule: 'None' as const,
  sixtyMoveRule: true,
  maxCheckCount: 0,
})

// 本地配置状态 - 使用响应式ref
const originalConfig = ref<ExtendedGameConfig>({
  gameMode: 'pvp',
  playerCamp: 'red',
  enableAI: false,
  aiConfig: createDefaultAIConfig(),
  aiVsAiConfig: undefined,
})

const localConfig = ref<ExtendedGameConfig>({
  gameMode: 'pvp',
  playerCamp: 'red',
  enableAI: false,
  aiConfig: createDefaultAIConfig(),
  aiVsAiConfig: undefined,
})

// 获取当前AI配置的计算属性
const currentAIConfig = computed(() => {
  if (localConfig.value.gameMode === 'ai-vs-ai') {
    if (activeAI.value === 'red') {
      return localConfig.value.aiVsAiConfig?.redAI || localConfig.value.aiConfig!
    } else {
      return localConfig.value.aiVsAiConfig?.blackAI || localConfig.value.aiConfig!
    }
  }
  return localConfig.value.aiConfig!
})

// 同步配置到本地状态的函数
const syncConfigToLocal = (newConfig: ExtendedGameConfig) => {
  const configCopy = JSON.parse(JSON.stringify(newConfig))

  // 确保基础aiConfig存在
  if (!configCopy.aiConfig) {
    configCopy.aiConfig = createDefaultAIConfig()
  }

  // 如果是AI vs AI模式，确保aiVsAiConfig存在
  if (configCopy.gameMode === 'ai-vs-ai') {
    if (!configCopy.aiVsAiConfig) {
      configCopy.aiVsAiConfig = {
        redAI: { ...createDefaultAIConfig() },
        blackAI: { ...createDefaultAIConfig() },
        gameSpeed: 2000,
      }
    }
    if (!configCopy.aiVsAiConfig.redAI) {
      configCopy.aiVsAiConfig.redAI = { ...createDefaultAIConfig() }
    }
    if (!configCopy.aiVsAiConfig.blackAI) {
      configCopy.aiVsAiConfig.blackAI = { ...createDefaultAIConfig() }
    }
  }

  originalConfig.value = configCopy
  localConfig.value = JSON.parse(JSON.stringify(configCopy))
}

// 监听props配置变化，更新本地配置
watch(() => props.config, syncConfigToLocal, { immediate: true, deep: true })

// 监听弹窗显示状态，每次打开时重新同步最新的配置
watch(
  () => props.show,
  (newShow) => {
    if (newShow) {
      // 弹窗打开时，重新同步最新的配置
      syncConfigToLocal(props.config)
    }
  },
)

// 同步通用设置到双AI配置
const syncCommonSettings = () => {
  if (
    !localConfig.value.aiConfig ||
    !localConfig.value.aiVsAiConfig?.redAI ||
    !localConfig.value.aiVsAiConfig?.blackAI
  )
    return

  // 通用设置列表
  const commonSettings = [
    'engine',
    'threads',
    'hashSize',
    'moveOverhead',
    'repetitionRule',
    'drawRule',
    'sixtyMoveRule',
    'maxCheckCount',
  ]

  // 同步通用设置到红方和黑方AI配置
  commonSettings.forEach((setting) => {
    if (setting in localConfig.value.aiConfig!) {
      ;(localConfig.value.aiVsAiConfig!.redAI as any)[setting] = (
        localConfig.value.aiConfig! as any
      )[setting]
      ;(localConfig.value.aiVsAiConfig!.blackAI as any)[setting] = (
        localConfig.value.aiConfig! as any
      )[setting]
    }
  })
}

// 复制红方设置到黑方 (只复制AI特定设置)
const copyRedToBlack = () => {
  if (localConfig.value.aiVsAiConfig?.redAI && localConfig.value.aiVsAiConfig?.blackAI) {
    // AI特定设置列表
    const aiSpecificSettings = [
      'skillLevel',
      'thinkingTime',
      'depth',
      'multiPV',
      'limitStrength',
      'uciElo',
      'ponder',
    ]

    aiSpecificSettings.forEach((setting) => {
      if (setting in localConfig.value.aiVsAiConfig!.redAI!) {
        ;(localConfig.value.aiVsAiConfig!.blackAI! as any)[setting] = (
          localConfig.value.aiVsAiConfig!.redAI! as any
        )[setting]
      }
    })
  }
}

// 复制黑方设置到红方 (只复制AI特定设置)
const copyBlackToRed = () => {
  if (localConfig.value.aiVsAiConfig?.blackAI && localConfig.value.aiVsAiConfig?.redAI) {
    // AI特定设置列表
    const aiSpecificSettings = [
      'skillLevel',
      'thinkingTime',
      'depth',
      'multiPV',
      'limitStrength',
      'uciElo',
      'ponder',
    ]

    aiSpecificSettings.forEach((setting) => {
      if (setting in localConfig.value.aiVsAiConfig!.blackAI!) {
        ;(localConfig.value.aiVsAiConfig!.redAI! as any)[setting] = (
          localConfig.value.aiVsAiConfig!.blackAI! as any
        )[setting]
      }
    })
  }
}

// 随机化AI设置 (只随机化AI特定设置)
const randomizeAISettings = () => {
  const randomSkillLevel = () => Math.floor(Math.random() * 21) // 0-20
  const randomTime = () => Math.floor(Math.random() * 30) + 1 // 1-30
  const randomDepth = () => Math.floor(Math.random() * 17) + 4 // 4-20
  const randomMultiPV = () => Math.floor(Math.random() * 10) + 1 // 1-10
  const randomElo = () => Math.floor(Math.random() * (3133 - 1280 + 1)) + 1280 // 1280-3133

  // 确保aiVsAiConfig存在
  if (!localConfig.value.aiVsAiConfig) {
    localConfig.value.aiVsAiConfig = {
      redAI: createDefaultAIConfig(),
      blackAI: createDefaultAIConfig(),
      gameSpeed: 2000,
    }
  }

  // 随机化红方设置
  if (!localConfig.value.aiVsAiConfig.redAI)
    localConfig.value.aiVsAiConfig.redAI = createDefaultAIConfig()
  localConfig.value.aiVsAiConfig.redAI.skillLevel = randomSkillLevel()
  localConfig.value.aiVsAiConfig.redAI.thinkingTime = randomTime()
  localConfig.value.aiVsAiConfig.redAI.depth = randomDepth()
  localConfig.value.aiVsAiConfig.redAI.multiPV = randomMultiPV()
  localConfig.value.aiVsAiConfig.redAI.limitStrength = Math.random() > 0.5
  localConfig.value.aiVsAiConfig.redAI.uciElo = randomElo()
  localConfig.value.aiVsAiConfig.redAI.ponder = Math.random() > 0.5

  // 随机化黑方设置
  if (!localConfig.value.aiVsAiConfig.blackAI)
    localConfig.value.aiVsAiConfig.blackAI = createDefaultAIConfig()
  localConfig.value.aiVsAiConfig.blackAI.skillLevel = randomSkillLevel()
  localConfig.value.aiVsAiConfig.blackAI.thinkingTime = randomTime()
  localConfig.value.aiVsAiConfig.blackAI.depth = randomDepth()
  localConfig.value.aiVsAiConfig.blackAI.multiPV = randomMultiPV()
  localConfig.value.aiVsAiConfig.blackAI.limitStrength = Math.random() > 0.5
  localConfig.value.aiVsAiConfig.blackAI.uciElo = randomElo()
  localConfig.value.aiVsAiConfig.blackAI.ponder = Math.random() > 0.5
}

// 取消按钮处理
const handleCancel = () => {
  // 重置本地配置
  localConfig.value = JSON.parse(JSON.stringify(originalConfig.value))
}

// 应用设置
const handleApply = () => {
  // 根据游戏模式确定是否启用AI
  localConfig.value.enableAI = localConfig.value.gameMode !== 'pvp'

  // 如果是AI vs AI模式，处理配置同步
  if (localConfig.value.gameMode === 'ai-vs-ai') {
    // 确保aiVsAiConfig存在
    if (!localConfig.value.aiVsAiConfig) {
      localConfig.value.aiVsAiConfig = {
        redAI: createDefaultAIConfig(),
        blackAI: createDefaultAIConfig(),
        gameSpeed: 2000,
      }
    }
    if (!localConfig.value.aiVsAiConfig.redAI) {
      localConfig.value.aiVsAiConfig.redAI = createDefaultAIConfig()
    }
    if (!localConfig.value.aiVsAiConfig.blackAI) {
      localConfig.value.aiVsAiConfig.blackAI = createDefaultAIConfig()
    }

    // 同步通用设置到双AI配置
    syncCommonSettings()
  }

  emit('update:config', { ...localConfig.value })
}

// 停止AI思考
const stopAI = () => {
  emit('stop-ai')
}

// 重置为默认配置
const resetToDefault = () => {
  const baseConfig = {
    gameMode: 'pvp' as const,
    playerCamp: 'red' as const,
    enableAI: false,
    aiConfig: createDefaultAIConfig(),
  }

  Object.assign(localConfig.value, baseConfig)

  // 如果是AI vs AI模式，重置aiVsAiConfig
  if (localConfig.value.gameMode === 'ai-vs-ai') {
    localConfig.value.aiVsAiConfig = {
      redAI: createDefaultAIConfig(),
      blackAI: createDefaultAIConfig(),
      gameSpeed: 2000,
    }
  }
}

// 监听通用设置变化，自动同步到双AI配置
watch(
  () => localConfig.value.aiConfig,
  () => {
    if (localConfig.value.gameMode === 'ai-vs-ai') {
      syncCommonSettings()
    }
  },
  { deep: true },
)
</script>

<style scoped>
/* 隐藏滚动条 */
.hide-scrollbar {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE 10+ */
}

.hide-scrollbar::-webkit-scrollbar {
  display: none; /* Chrome Safari */
}

/* 自定义滑块样式 */
input[type='range'] {
  -webkit-appearance: none;
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #e5e7eb;
  outline: none;
  margin: 8px 0;
}

input[type='range']::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  border: 2px solid #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

input[type='range']::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  border: 2px solid #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* 单选按钮和复选框样式 */
input[type='radio'],
input[type='checkbox'] {
  width: 16px;
  height: 16px;
}

input[type='radio'].accent-red-500,
input[type='checkbox'].accent-red-500 {
  accent-color: #ef4444;
}

input[type='radio'].accent-gray-600,
input[type='checkbox'].accent-gray-600 {
  accent-color: #4b5563;
}

input[type='radio']:not([class*='accent-']),
input[type='checkbox']:not([class*='accent-']) {
  accent-color: #3b82f6;
}

/* 选择框样式 */
select {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 8px center;
  background-repeat: no-repeat;
  background-size: 16px 12px;
  padding-right: 32px;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4 {
    grid-template-columns: 1fr;
  }
}

@media (min-width: 769px) and (max-width: 1023px) {
  .grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4 {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) and (max-width: 1279px) {
  .grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4 {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1280px) {
  .grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4 {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* 动画效果 */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* 过渡效果 */
.transition-colors {
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

/* 按钮悬停效果 */
button:hover {
  transition: all 0.2s ease-in-out;
}

/* 确保所有输入控件没有焦点边框 */
button:focus,
select:focus,
input:focus {
  outline: none !important;
  box-shadow: none !important;
}

button:focus-visible,
select:focus-visible,
input:focus-visible {
  outline: none !important;
  box-shadow: none !important;
}

/* 移除输入框和滑块的焦点样式 */
input[type='range']:focus {
  outline: none;
  box-shadow: none;
}

input[type='radio']:focus,
input[type='checkbox']:focus {
  outline: none;
  box-shadow: none;
}
</style>
