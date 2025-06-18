<template>
  <SettingsDialog
    v-model="show"
    title="🐟 象棋AI设置 (Pikafish)"
    width="1400px"
    max-width="90vw"
    :apply-callback="handleApply"
    :cancel-callback="handleCancel"
    :reset-callback="resetToDefault"
    :old-data="originalConfig"
    :new-data="localConfig"
  >
    <div class="space-y-3">
      <!-- AI对战状态提示 - 使用固定布局避免抽搐 -->
      <div class="ai-status-container">
        <Transition
          name="ai-status"
          enter-active-class="transition-all duration-300 ease-out"
          leave-active-class="transition-all duration-300 ease-in"
          enter-from-class="opacity-0 scale-95 -translate-y-2"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-from-class="opacity-100 scale-100 translate-y-0"
          leave-to-class="opacity-0 scale-95 -translate-y-2"
        >
          <div
            v-if="localConfig.gameMode === 'ai-vs-ai' && aiVsAiRunning"
            class="p-2 bg-gradient-to-r border rounded-lg shadow-sm"
            :class="
              debouncedAIThinking
                ? 'from-yellow-50 to-orange-50 border-yellow-200'
                : 'from-blue-50 to-indigo-50 border-blue-200'
            "
          >
            <div v-if="debouncedAIThinking" class="flex items-center gap-2 text-yellow-800">
              <div
                class="w-3 h-3 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin"
              ></div>
              <span class="font-medium text-sm">⚠️ AI正在思考中</span>
              <div class="ml-auto">
                <button
                  @click="stopAIAndVsAi"
                  class="px-2 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors text-xs font-medium"
                >
                  停止对战
                </button>
              </div>
            </div>
            <div v-else class="flex items-center gap-2 text-blue-800">
              <div class="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              <span class="font-medium text-sm">🤖 AI对战进行中</span>
              <div class="ml-auto">
                <button
                  @click="stopAIVsAi"
                  class="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-xs font-medium"
                >
                  停止对战
                </button>
              </div>
            </div>
            <p
              class="text-xs mt-1"
              :class="debouncedAIThinking ? 'text-yellow-700' : 'text-blue-700'"
            >
              配置更改将立即生效，建议等AI完成当前思考后再修改设置以获得最佳体验。
            </p>
          </div>
        </Transition>
      </div>

      <!-- AI对战模式设置区域 -->
      <div v-if="localConfig.gameMode === 'ai-vs-ai'" class="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <!-- AI对战基础设置 -->
        <div
          class="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg shadow-sm"
        >
          <div class="flex items-center gap-2 mb-3">
            <span class="text-lg">🤖</span>
            <h4 class="font-bold text-blue-800 text-sm">AI对战设置</h4>
          </div>

          <div class="space-y-3">
            <!-- AI选择切换 -->
            <div class="space-y-2">
              <h5 class="text-xs font-semibold text-gray-700">配置对象</h5>
              <div class="flex gap-2">
                <label
                  class="flex items-center gap-1 px-3 py-1 border rounded-md cursor-pointer transition-colors text-sm"
                  :class="
                    activeAI === 'red'
                      ? 'bg-red-50 border-red-300 text-red-700'
                      : 'bg-white border-gray-300'
                  "
                >
                  <input type="radio" v-model="activeAI" value="red" class="accent-red-500" />
                  <span class="font-medium">🔴 红方</span>
                </label>
                <label
                  class="flex items-center gap-1 px-3 py-1 border rounded-md cursor-pointer transition-colors text-sm"
                  :class="
                    activeAI === 'black'
                      ? 'bg-gray-50 border-gray-400 text-gray-700'
                      : 'bg-white border-gray-300'
                  "
                >
                  <input type="radio" v-model="activeAI" value="black" class="accent-gray-600" />
                  <span class="font-medium">⚫ 黑方</span>
                </label>
              </div>
            </div>

            <!-- AI对战游戏速度 -->
            <div class="space-y-2">
              <h5 class="text-xs font-semibold text-gray-700">
                对战速度: {{ localConfig.aiVsAiConfig?.gameSpeed || 2000 }}ms
              </h5>
              <input
                v-model.number="localConfig.aiVsAiConfig!.gameSpeed"
                type="range"
                min="100"
                max="10000"
                step="100"
                class="w-full accent-blue-500"
              />
              <div class="flex justify-between text-xs text-gray-500">
                <span>100ms</span>
                <span>2s</span>
                <span>10s</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 快速配置 -->
        <div class="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
          <div class="flex items-center gap-2 mb-3">
            <span class="text-lg">⚡</span>
            <h4 class="font-bold text-gray-800 text-sm">快速配置</h4>
          </div>

          <div class="space-y-2">
            <button
              @click="copyRedToBlack"
              class="w-full flex items-center justify-center gap-1 px-3 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-md hover:from-red-600 hover:to-red-700 transition-all text-sm font-medium"
            >
              <span>🔴➡️⚫</span>
              <span>复制红方→黑方</span>
            </button>

            <button
              @click="copyBlackToRed"
              class="w-full flex items-center justify-center gap-1 px-3 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-md hover:from-gray-600 hover:to-gray-700 transition-all text-sm font-medium"
            >
              <span>⚫➡️🔴</span>
              <span>复制黑方→红方</span>
            </button>

            <button
              @click="randomizeAISettings"
              class="w-full flex items-center justify-center gap-1 px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-md hover:from-green-600 hover:to-emerald-700 transition-all text-sm font-medium"
            >
              <span>🎲</span>
              <span>随机化设置</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 配置面板主体 -->
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <!-- 左侧：AI特定设置 -->
        <div class="space-y-4">
          <!-- 棋力设置卡片 -->
          <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
            <div class="flex items-center gap-2 mb-3">
              <span class="text-lg">⚡</span>
              <h4 class="font-bold text-gray-800 text-sm">
                棋力设置
                <span
                  v-if="localConfig.gameMode === 'ai-vs-ai'"
                  class="text-xs font-normal ml-2 px-2 py-1 rounded-full"
                  :class="
                    activeAI === 'red' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                  "
                >
                  {{ activeAI === 'red' ? '🔴 红方' : '⚫ 黑方' }}
                </span>
              </h4>
            </div>

            <div class="space-y-3" v-if="currentAIConfig">
              <!-- 棋力水平 -->
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <label class="text-sm font-semibold text-gray-700">棋力水平</label>
                  <span class="text-sm font-bold text-blue-600">{{
                    currentAIConfig.skillLevel
                  }}</span>
                </div>
                <input
                  v-model.number="currentAIConfig.skillLevel"
                  type="range"
                  min="0"
                  max="20"
                  step="1"
                  class="w-full h-2 rounded-lg appearance-none bg-gradient-to-r from-red-200 via-yellow-200 to-green-200 accent-blue-500"
                />
                <div class="flex justify-between text-xs text-gray-500">
                  <span>0 (最弱)</span>
                  <span>10 (中等)</span>
                  <span>20 (最强)</span>
                </div>
              </div>

              <!-- 等级制限制 -->
              <div class="space-y-2">
                <label class="flex items-center gap-2">
                  <input
                    type="checkbox"
                    v-model="currentAIConfig.limitStrength"
                    class="w-4 h-4 accent-blue-500"
                  />
                  <span class="text-sm font-semibold text-gray-700">启用等级制限制</span>
                </label>

                <!-- UCI Elo (当启用等级制限制时) -->
                <div
                  v-if="currentAIConfig?.limitStrength"
                  class="ml-6 space-y-2 p-3 bg-gray-50 rounded-lg"
                >
                  <div class="flex items-center justify-between">
                    <label class="text-sm font-semibold text-gray-700">ELO等级</label>
                    <span class="text-sm font-bold text-orange-600">{{
                      currentAIConfig?.uciElo
                    }}</span>
                  </div>
                  <input
                    v-model.number="currentAIConfig.uciElo"
                    type="range"
                    min="1280"
                    max="3133"
                    step="1"
                    class="w-full accent-orange-500"
                  />
                  <div class="flex justify-between text-xs text-gray-500">
                    <span>1280</span>
                    <span>2200</span>
                    <span>3133</span>
                  </div>
                </div>
              </div>

              <!-- 思考时间 -->
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <label class="text-sm font-semibold text-gray-700">思考时间</label>
                  <span class="text-sm font-bold text-green-600"
                    >{{ currentAIConfig?.thinkingTime || currentAIConfig?.timeLimit }}秒</span
                  >
                </div>
                <input
                  v-model.number="currentAIConfig.thinkingTime"
                  type="range"
                  min="1"
                  max="30"
                  step="1"
                  class="w-full accent-green-500"
                />
                <div class="flex justify-between text-xs text-gray-500">
                  <span>1秒</span>
                  <span>15秒</span>
                  <span>30秒</span>
                </div>
              </div>

              <!-- 搜索深度 -->
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <label class="text-sm font-semibold text-gray-700">搜索深度</label>
                  <span class="text-sm font-bold text-purple-600">{{
                    currentAIConfig?.depth
                  }}</span>
                </div>
                <input
                  v-model.number="currentAIConfig.depth"
                  type="range"
                  min="4"
                  max="20"
                  step="1"
                  class="w-full accent-purple-500"
                />
                <div class="flex justify-between text-xs text-gray-500">
                  <span>4 (快)</span>
                  <span>12 (平衡)</span>
                  <span>20 (深)</span>
                </div>
                <p class="text-xs text-gray-500">搜索层数，影响棋力和思考时间</p>
              </div>
            </div>
          </div>

          <!-- 搜索设置卡片 -->
          <div class="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
            <div class="flex items-center gap-2 mb-4">
              <span class="text-xl">🔍</span>
              <h4 class="font-bold text-gray-800">
                搜索设置
                <span
                  v-if="localConfig.gameMode === 'ai-vs-ai'"
                  class="text-sm font-normal ml-2 px-2 py-1 rounded-full"
                  :class="
                    activeAI === 'red' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                  "
                >
                  {{ activeAI === 'red' ? '🔴 红方' : '⚫ 黑方' }}
                </span>
              </h4>
            </div>

            <div class="space-y-5">
              <!-- MultiPV (多变化分析) -->
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <label class="text-sm font-semibold text-gray-700">分析变化数</label>
                  <span class="text-sm font-bold text-indigo-600">{{
                    currentAIConfig?.multiPV
                  }}</span>
                </div>
                <input
                  v-model.number="currentAIConfig.multiPV"
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  class="w-full accent-indigo-500"
                />
                <div class="flex justify-between text-xs text-gray-500">
                  <span>1</span>
                  <span>5</span>
                  <span>10</span>
                </div>
                <p class="text-xs text-gray-500">同时分析的最佳变化数量</p>
              </div>

              <!-- 后台思考 -->
              <div class="space-y-3">
                <label class="flex items-center gap-2">
                  <input
                    type="checkbox"
                    v-model="currentAIConfig.ponder"
                    class="w-4 h-4 accent-blue-500"
                  />
                  <span class="text-sm font-semibold text-gray-700">启用后台思考</span>
                </label>
                <p class="text-xs text-gray-500">对手思考时AI也进行分析</p>
              </div>

              <!-- 将死威胁深度 -->
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <label class="text-sm font-semibold text-gray-700">将死威胁深度</label>
                  <span class="text-sm font-bold text-red-600">{{
                    currentAIConfig?.mateThreatDepth
                  }}</span>
                </div>
                <input
                  v-model.number="currentAIConfig.mateThreatDepth"
                  type="range"
                  min="0"
                  max="10"
                  step="1"
                  class="w-full accent-red-500"
                />
                <div class="flex justify-between text-xs text-gray-500">
                  <span>0</span>
                  <span>5</span>
                  <span>10</span>
                </div>
                <p class="text-xs text-gray-500">将死威胁分析深度</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧：通用设置 -->
        <div class="space-y-4">
          <!-- 性能设置卡片 -->
          <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
            <div class="flex items-center gap-2 mb-3">
              <span class="text-lg">⚙️</span>
              <h4 class="font-bold text-gray-800 text-sm">性能设置 (通用)</h4>
            </div>

            <div class="space-y-3">
              <!-- 哈希表大小 -->
              <div class="space-y-2">
                <label class="text-sm font-semibold text-gray-700">哈希表大小</label>
                <select
                  v-model.number="localConfig.aiConfig!.hashSize"
                  class="w-full p-2 border border-gray-300 rounded-md text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              </div>

              <!-- 线程数 -->
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <label class="text-sm font-semibold text-gray-700">计算线程</label>
                  <span class="text-sm font-bold text-blue-600">{{
                    localConfig.aiConfig?.threads
                  }}</span>
                </div>
                <input
                  v-model.number="localConfig.aiConfig!.threads"
                  type="range"
                  min="1"
                  max="16"
                  step="1"
                  class="w-full accent-blue-500"
                />
                <div class="flex justify-between text-xs text-gray-500">
                  <span>1</span>
                  <span>8</span>
                  <span>16</span>
                </div>
                <p class="text-xs text-gray-500">并行计算使用的线程数</p>
              </div>

              <!-- Move Overhead -->
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <label class="text-sm font-semibold text-gray-700">移动开销</label>
                  <span class="text-sm font-bold text-orange-600"
                    >{{ localConfig.aiConfig?.moveOverhead }}ms</span
                  >
                </div>
                <input
                  v-model.number="localConfig.aiConfig!.moveOverhead"
                  type="range"
                  min="0"
                  max="1000"
                  step="10"
                  class="w-full accent-orange-500"
                />
                <div class="flex justify-between text-xs text-gray-500">
                  <span>0ms</span>
                  <span>500ms</span>
                  <span>1000ms</span>
                </div>
                <p class="text-xs text-gray-500">GUI延迟补偿时间</p>
              </div>

              <!-- 节点时间 -->
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <label class="text-sm font-semibold text-gray-700">节点时间</label>
                  <span class="text-sm font-bold text-purple-600"
                    >{{ localConfig.aiConfig?.nodestime }}ms</span
                  >
                </div>
                <input
                  v-model.number="localConfig.aiConfig!.nodestime"
                  type="range"
                  min="0"
                  max="10000"
                  step="100"
                  class="w-full accent-purple-500"
                />
                <div class="flex justify-between text-xs text-gray-500">
                  <span>0ms</span>
                  <span>5000ms</span>
                  <span>10000ms</span>
                </div>
                <p class="text-xs text-gray-500">节点搜索时间控制</p>
              </div>

              <!-- 最大将军次数 -->
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <label class="text-sm font-semibold text-gray-700">最大将军次数</label>
                  <span class="text-sm font-bold text-red-600">
                    {{
                      (localConfig.aiConfig?.maxCheckCount ?? 0) === 0
                        ? '无限制'
                        : localConfig.aiConfig?.maxCheckCount
                    }}
                  </span>
                </div>
                <input
                  v-model.number="localConfig.aiConfig!.maxCheckCount"
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  class="w-full accent-red-500"
                />
                <div class="flex justify-between text-xs text-gray-500">
                  <span>0 (无限制)</span>
                  <span>50</span>
                  <span>100</span>
                </div>
                <p class="text-xs text-gray-500">限制连续将军次数</p>
              </div>
            </div>
          </div>

          <!-- 规则设置卡片 -->
          <div class="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
            <div class="flex items-center gap-2 mb-4">
              <span class="text-xl">📋</span>
              <h4 class="font-bold text-gray-800">象棋规则 (通用)</h4>
            </div>

            <div class="space-y-5">
              <!-- 长将/长捉规则 -->
              <div class="space-y-3">
                <label class="text-sm font-semibold text-gray-700">长将/长捉规则</label>
                <select
                  v-model="localConfig.aiConfig!.repetitionRule"
                  class="w-full p-3 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="AsianRule">亚洲规则</option>
                  <option value="ChineseRule">中国规则</option>
                  <option value="ComputerRule">计算机规则</option>
                </select>
                <p class="text-xs text-gray-500">处理重复局面的规则</p>
              </div>

              <!-- 和棋规则 -->
              <div class="space-y-3">
                <label class="text-sm font-semibold text-gray-700">和棋规则</label>
                <select
                  v-model="localConfig.aiConfig!.drawRule"
                  class="w-full p-3 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="None">无和棋</option>
                  <option value="DrawAsBlackWin">和棋算黑胜</option>
                  <option value="DrawAsRedWin">和棋算红胜</option>
                </select>
                <p class="text-xs text-gray-500">和棋局面的判决规则</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </SettingsDialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, getCurrentInstance, onBeforeUnmount } from 'vue'
import type { GameConfig } from './ChessGameWrapper'
import type { AIEngineConfig } from './ai/types'
import SettingsDialog from '../SettingsDialog.vue'

// 定义store类型
interface Store {
  state: any
  commit: (type: string, payload?: any) => void
  getters: any
}

// 使用store（直接从全局注入）
const store = getCurrentInstance()?.appContext.config.globalProperties.$store as Store

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

// 直接从store获取配置，简化接口
const storeGameConfig = computed(() => store.state.chess.gameConfig)

// 获取AI对战运行状态
const aiVsAiRunning = computed(() => store.state.chess?.gameState?.aiVsAiRunning || false)

// 创建默认AI配置的工厂函数
const createDefaultAIConfig = (): AIEngineConfig => ({
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
  nodestime: 0,
  mateThreatDepth: 1,
  repetitionRule: 'AsianRule' as const,
  drawRule: 'None' as const,
  maxCheckCount: 0,
})

// 本地配置状态 - 使用响应式ref，初始化时使用store的配置
const originalConfig = ref<GameConfig>({})
const localConfig = ref<GameConfig>({})

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

// 创建完整的配置对象，合并store配置和props配置
const createFullConfig = (storeConfig: any, propsConfig: GameConfig): GameConfig => {
  const baseConfig: GameConfig = {
    gameMode: propsConfig.gameMode || storeConfig.gameMode || 'pvp',
    playerCamp: propsConfig.playerCamp || storeConfig.playerCamp || 'red',
    enableAI: propsConfig.enableAI || storeConfig.enableAI || false,
    // 合并AI配置
    aiConfig: {
      ...createDefaultAIConfig(),
      ...storeConfig.aiConfig,
      ...propsConfig.aiConfig,
    },
  }

  // 处理aiVsAiConfig - 无论何种模式都要初始化，确保UI不出错
  const storeAiVsAiConfig = storeConfig.aiVsAiConfig || {}
  const propsAiVsAiConfig = propsConfig.aiVsAiConfig || {}

  baseConfig.aiVsAiConfig = {
    gameSpeed: (propsAiVsAiConfig as any).gameSpeed || storeAiVsAiConfig.gameSpeed || 2000,
    redAI: {
      ...baseConfig.aiConfig,
      ...storeAiVsAiConfig.redAI,
      ...(propsAiVsAiConfig as any).redAI,
    },
    blackAI: {
      ...baseConfig.aiConfig,
      ...storeAiVsAiConfig.blackAI,
      ...(propsAiVsAiConfig as any).blackAI,
    },
  }

  return baseConfig
}

// 同步配置到本地状态的函数
const syncConfigToLocal = () => {
  const fullConfig = createFullConfig(storeGameConfig.value, props.config)

  originalConfig.value = JSON.parse(JSON.stringify(fullConfig))
  localConfig.value = JSON.parse(JSON.stringify(fullConfig))
}

// 监听props配置变化和store变化，更新本地配置
watch(() => [props.config, storeGameConfig.value], syncConfigToLocal, {
  immediate: true,
  deep: true,
})

// 监听弹窗显示状态，每次打开时重新同步最新的配置
watch(
  () => props.show,
  (newShow) => {
    if (newShow) {
      // 弹窗打开时，重新同步最新的配置
      syncConfigToLocal()
    }
  },
)

// 防抖处理AI状态显示，避免频繁切换导致的抖动
const debouncedAIThinking = ref(false)
let aiStatusTimer: number | null = null

// 监听AI思考状态变化，使用防抖避免抖动
// 只有在AI对战模式运行时才监听思考状态
watch(
  () => aiVsAiRunning.value && props.aiStatus?.thinking,
  (newThinking) => {
    if (aiStatusTimer) {
      clearTimeout(aiStatusTimer)
    }

    if (newThinking) {
      // AI开始思考时立即显示
      debouncedAIThinking.value = true
    } else {
      // AI停止思考时延迟隐藏，避免快速切换
      aiStatusTimer = window.setTimeout(() => {
        debouncedAIThinking.value = false
      }, 300)
    }
  },
  { immediate: true },
)

// 监听AI对战运行状态，当停止时立即隐藏思考状态
watch(
  () => aiVsAiRunning.value,
  (running) => {
    if (!running) {
      // AI对战停止时立即清除思考状态
      debouncedAIThinking.value = false
      if (aiStatusTimer) {
        clearTimeout(aiStatusTimer)
        aiStatusTimer = null
      }
    }
  },
  { immediate: true },
)

// 组件卸载时清理定时器
onBeforeUnmount(() => {
  if (aiStatusTimer) {
    clearTimeout(aiStatusTimer)
  }
})

// 监听 AI 对战游戏速度的变化，实时同步到 store
watch(
  () => localConfig.value.aiVsAiConfig?.gameSpeed,
  (newSpeed) => {
    if (newSpeed && localConfig.value.gameMode === 'ai-vs-ai') {
      console.log('AI对战速度更新:', newSpeed)
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

  // 通用设置列表（这些设置对所有AI实例都相同）
  const commonSettings = [
    'engine',
    'threads',
    'hashSize',
    'moveOverhead',
    'nodestime',
    'repetitionRule',
    'drawRule',
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
    // AI特定设置列表（这些设置可以因AI而异）
    const aiSpecificSettings = [
      'skillLevel',
      'thinkingTime',
      'depth',
      'multiPV',
      'limitStrength',
      'uciElo',
      'ponder',
      'mateThreatDepth',
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
      'mateThreatDepth',
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
  const randomMateThreat = () => Math.floor(Math.random() * 11) // 0-10

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
  localConfig.value.aiVsAiConfig.redAI.mateThreatDepth = randomMateThreat()

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
  localConfig.value.aiVsAiConfig.blackAI.mateThreatDepth = randomMateThreat()
}

// 取消按钮处理
const handleCancel = () => {
  // 重置本地配置到原始状态
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

    // 同步通用设置到双AI配置
    syncCommonSettings()

    // 单独更新AI对战游戏速度
    store.commit('chess/updateGameSpeed', localConfig.value.aiVsAiConfig.gameSpeed)
  }

  // 保存到store
  store.commit('chess/saveGameConfig', localConfig.value)

  // 发出更新事件
  emit('update:config', { ...localConfig.value })
}


// 停止AI思考并停止AI对战
const stopAIAndVsAi = () => {
  emit('stop-ai')
  store.commit('chess/setAiVsAiRunning', false)
}

// 仅停止AI对战
const stopAIVsAi = () => {
  store.commit('chess/setAiVsAiRunning', false)
}

// 重置为默认配置
const resetToDefault = () => {
  const defaultConfig: GameConfig = {
    gameMode: 'pvp',
    playerCamp: 'red',
    enableAI: false,
    aiConfig: createDefaultAIConfig(),
  }

  // 如果是AI vs AI模式，重置aiVsAiConfig
  if (localConfig.value.gameMode === 'ai-vs-ai') {
    defaultConfig.aiVsAiConfig = {
      redAI: createDefaultAIConfig(),
      blackAI: createDefaultAIConfig(),
      gameSpeed: 2000,
    }
  }

  localConfig.value = { ...defaultConfig }
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
  height: 8px;
  border-radius: 4px;
  background: linear-gradient(to right, #e5e7eb 0%, #d1d5db 100%);
  outline: none;
  margin: 8px 0;
  transition: all 0.2s ease;
}

input[type='range']::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  cursor: pointer;
  border: 3px solid #ffffff;
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
  transition: all 0.2s ease;
}

input[type='range']::-webkit-slider-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 12px rgba(59, 130, 246, 0.4);
}

input[type='range']::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  cursor: pointer;
  border: 3px solid #ffffff;
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
  transition: all 0.2s ease;
}

/* 彩色滑块主题 */
input[type='range'].accent-red-500::-webkit-slider-thumb {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  box-shadow: 0 4px 8px rgba(239, 68, 68, 0.3);
}

input[type='range'].accent-orange-500::-webkit-slider-thumb {
  background: linear-gradient(135deg, #f97316, #ea580c);
  box-shadow: 0 4px 8px rgba(249, 115, 22, 0.3);
}

input[type='range'].accent-green-500::-webkit-slider-thumb {
  background: linear-gradient(135deg, #10b981, #059669);
  box-shadow: 0 4px 8px rgba(16, 185, 129, 0.3);
}

input[type='range'].accent-purple-500::-webkit-slider-thumb {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  box-shadow: 0 4px 8px rgba(139, 92, 246, 0.3);
}

input[type='range'].accent-indigo-500::-webkit-slider-thumb {
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  box-shadow: 0 4px 8px rgba(99, 102, 241, 0.3);
}

/* 单选按钮和复选框样式 */
input[type='radio'],
input[type='checkbox'] {
  width: 16px;
  height: 16px;
  transition: all 0.2s ease;
}

input[type='radio']:hover,
input[type='checkbox']:hover {
  transform: scale(1.05);
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
  background-position: right 12px center;
  background-repeat: no-repeat;
  background-size: 16px 12px;
  padding-right: 40px;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  transition: all 0.2s ease;
}

select:hover {
  border-color: #6b7280;
}

/* 输入框焦点样式 */
input[type='text']:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* 卡片悬停效果 */
.bg-white {
  transition: all 0.2s ease;
}

.bg-white:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

/* 按钮悬停效果 */
button {
  transition: all 0.2s ease;
}

button:hover {
  transform: translateY(-1px);
}

button:active {
  transform: translateY(0);
}

/* 渐变背景动画 */
.bg-gradient-to-r {
  background-size: 200% 200%;
  animation: gradientShift 3s ease infinite;
}

@keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

/* 加载动画 */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* 脉冲动画 */
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .grid-cols-1.xl\\:grid-cols-2 {
    grid-template-columns: 1fr;
  }

  .grid-cols-1.lg\\:grid-cols-2 {
    grid-template-columns: 1fr;
  }
}

@media (min-width: 1024px) {
  .grid-cols-1.lg\\:grid-cols-2 {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1280px) {
  .grid-cols-1.xl\\:grid-cols-2 {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* 确保所有输入控件没有焦点边框 */
button:focus,
select:focus,
input:focus {
  outline: none !important;
}

button:focus-visible,
select:focus-visible,
input:focus-visible {
  outline: 2px solid #3b82f6 !important;
  outline-offset: 2px !important;
}

/* 移除输入框和滑块的默认焦点样式 */
input[type='range']:focus {
  outline: none;
}

input[type='radio']:focus,
input[type='checkbox']:focus {
  outline: none;
}

/* 特殊状态指示器 */
.status-indicator {
  position: relative;
}

.status-indicator::before {
  content: '';
  position: absolute;
  top: -2px;
  right: -2px;
  width: 8px;
  height: 8px;
  background: #10b981;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

/* 工具提示样式 */
.tooltip {
  position: relative;
}

.tooltip:hover::after {
  content: attr(data-tooltip);
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  z-index: 1000;
}

/* 确保AI状态变化时布局稳定 */
.ai-status-container {
  min-height: 0;
  position: relative;
  overflow: hidden;
}

/* AI状态提示过渡动画 */
.ai-status-enter-active,
.ai-status-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.ai-status-enter-from {
  opacity: 0;
  transform: translateY(-8px) scale(0.98);
  max-height: 0;
}

.ai-status-enter-to {
  opacity: 1;
  transform: translateY(0) scale(1);
  max-height: 120px;
}

.ai-status-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
  max-height: 120px;
}

.ai-status-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.98);
  max-height: 0;
}

/* 防止AI状态变化时的布局抖动 */
.space-y-3 {
  transition: all 0.2s ease;
}

.space-y-3 > .ai-status-container {
  margin-bottom: 0.75rem;
}
</style>
