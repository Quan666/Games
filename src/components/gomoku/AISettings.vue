<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
  >
    <div class="bg-white rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
      <h3 class="text-xl font-bold text-gray-800 mb-4">🤖 AI 高级设置</h3>

      <!-- AI状态提示 -->
      <div v-if="aiThinking" class="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
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
      <div
        v-else-if="isGameInProgress"
        class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg"
      >
        <div class="flex items-center gap-2 text-blue-800">
          <span class="font-medium">ℹ️ 游戏进行中</span>
        </div>
        <p class="text-sm text-blue-700 mt-1">
          配置更改将立即生效且不会重新开始当前对局。部分设置可能在下一局游戏时才能完全生效。
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- 基础参数设置 -->
        <div class="space-y-4">
          <h4 class="font-semibold text-gray-700 border-b pb-1">⚙️ 基础参数</h4>

          <!-- 游戏规则 -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">游戏规则</label>
            <select
              v-model.number="aiSettings.rule"
              class="w-full p-2 border border-gray-300 rounded-lg"
            >
              <option :value="0">自由规则 (无禁手)</option>
              <option :value="1">标准规则</option>
              <option :value="2">连珠规则 (有禁手)</option>
              <option :value="4">连珠规则2</option>
              <option :value="5">无禁手2</option>
            </select>
          </div>

          <!-- AI强度 -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              AI 强度: {{ aiSettings.strength }}%
            </label>
            <input
              v-model.number="aiSettings.strength"
              type="range"
              min="1"
              max="100"
              step="1"
              class="w-full"
            />
            <div class="flex justify-between text-xs text-gray-500 mt-1">
              <span>1%</span>
              <span>100%</span>
            </div>
          </div>

          <!-- AI执子 -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">AI 执子</label>
            <div class="space-y-2">
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
        </div>

        <!-- 搜索设置 -->
        <div class="space-y-4">
          <h4 class="font-semibold text-gray-700 border-b pb-1">🔍 搜索设置</h4>

          <!-- 搜索范围 -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              候选范围: {{ aiSettings.candRange }}
            </label>
            <input
              v-model.number="aiSettings.candRange"
              type="range"
              min="1"
              max="5"
              step="1"
              class="w-full"
            />
            <div class="flex justify-between text-xs text-gray-500 mt-1">
              <span>1 (窄)</span>
              <span>5 (广)</span>
            </div>
            <p class="text-xs text-gray-500">候选点搜索范围</p>
          </div>

          <!-- 最大搜索深度 -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              最大深度: {{ aiSettings.maxDepth }}
            </label>
            <input
              v-model.number="aiSettings.maxDepth"
              type="range"
              min="1"
              max="100"
              step="1"
              class="w-full"
            />
            <div class="flex justify-between text-xs text-gray-500 mt-1">
              <span>1</span>
              <span>100</span>
            </div>
            <p class="text-xs text-gray-500">搜索最大深度</p>
          </div>

          <!-- 最大节点数 -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">最大节点数</label>
            <input
              v-model.number="aiSettings.maxNodes"
              type="number"
              min="0"
              max="100000000"
              class="w-full p-2 border border-gray-300 rounded-lg"
            />
            <p class="text-xs text-gray-500">0=无限制</p>
          </div>

          <!-- 最佳着法数量 -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              最佳变化数: {{ aiSettings.nbest }}
            </label>
            <input
              v-model.number="aiSettings.nbest"
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
            <p class="text-xs text-gray-500">显示最佳变化数量</p>
          </div>
        </div>

        <!-- 时间和性能设置 -->
        <div class="space-y-4">
          <h4 class="font-semibold text-gray-700 border-b pb-1">⏱️ 时间和性能</h4>

          <!-- 单步思考时间 -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              思考时间: {{ aiSettings.turnTime / 1000 }}秒
            </label>
            <input
              v-model.number="aiSettings.turnTime"
              type="range"
              min="1000"
              max="30000"
              step="1000"
              class="w-full"
            />
            <div class="flex justify-between text-xs text-gray-500 mt-1">
              <span>1秒</span>
              <span>30秒</span>
            </div>
          </div>

          <!-- 总对局时间 -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              总时间: {{ Math.round(aiSettings.matchTime / 60000) }}分钟
            </label>
            <input
              v-model.number="aiSettings.matchTime"
              type="range"
              min="60000"
              max="1800000"
              step="60000"
              class="w-full"
            />
            <div class="flex justify-between text-xs text-gray-500 mt-1">
              <span>1分钟</span>
              <span>30分钟</span>
            </div>
          </div>

          <!-- 线程数 -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              线程数: {{ aiSettings.threads }}
            </label>
            <input
              v-model.number="aiSettings.threads"
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
          </div>

          <!-- 哈希表大小 -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">哈希大小</label>
            <select
              v-model.number="aiSettings.hashSize"
              class="w-full p-2 border border-gray-300 rounded-lg"
            >
              <option :value="64">64 MB</option>
              <option :value="128">128 MB</option>
              <option :value="256">256 MB</option>
              <option :value="512">512 MB</option>
              <option :value="1024">1024 MB</option>
            </select>
          </div>
        </div>
      </div>

      <!-- 高级选项 -->
      <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- 配置选项 -->
        <div class="bg-gray-50 rounded-lg p-4">
          <h4 class="font-semibold text-gray-700 mb-3">⚙️ 配置选项</h4>
          <div class="space-y-3">
            <!-- 配置文件 -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">配置文件</label>
              <select
                v-model.number="aiSettings.configIndex"
                class="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option :value="0">config-default.toml</option>
                <option :value="1">config-210901.toml</option>
                <option :value="2">config-220723.toml</option>
              </select>
            </div>

            <!-- 开关选项 -->
            <div class="space-y-2">
              <label class="flex items-center">
                <input v-model="aiSettings.pondering" type="checkbox" class="mr-2" />
                <span class="text-sm">后台思考</span>
              </label>
              <label class="flex items-center">
                <input v-model="aiSettings.showDetail" type="checkbox" class="mr-2" />
                <span class="text-sm">详细输出</span>
              </label>
              <label class="flex items-center">
                <input v-model="gameSettings.swapable" type="checkbox" class="mr-2" />
                <span class="text-sm">允许交换</span>
              </label>
            </div>
          </div>
        </div>

        <!-- 显示设置 -->
        <div class="bg-gray-50 rounded-lg p-4">
          <h4 class="font-semibold text-gray-700 mb-3">👁️ 显示设置</h4>
          <div class="space-y-2">
            <label class="flex items-center">
              <input v-model="gameSettings.showMoveOrder" type="checkbox" class="mr-2" />
              <span class="text-sm">显示落子顺序</span>
            </label>
            <label class="flex items-center">
              <input v-model="gameSettings.showLastMove" type="checkbox" class="mr-2" />
              <span class="text-sm">显示最后一步</span>
            </label>
            <label class="flex items-center">
              <input v-model="gameSettings.showStatusPanel" type="checkbox" class="mr-2" />
              <span class="text-sm">显示AI状态监控</span>
            </label>
          </div>
          <p class="text-xs text-gray-500 mt-2">这些设置会影响游戏界面显示</p>
        </div>
      </div>

      <div class="flex gap-3 mt-6">
        <button
          @click="handleReset"
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
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
// @ts-ignore
import { useStore } from 'vuex'

const store = useStore()

const show = computed(() => store.state.gomoku.ui.showAISettings)
const aiThinking = computed(() => store.state.gomoku.gameState.aiThinking)
const isGameInProgress = computed(
  () => store.state.gomoku.gameState.moveCount > 0 && !store.state.gomoku.gameState.gameOver,
)

// 本地副本
const localAiSettings = ref({ ...store.state.gomoku.aiSettings })
const localAiPlayer = ref(store.state.gomoku.aiPlayer)
const localGameSettings = ref({ ...store.state.gomoku.gameSettings })

// 弹窗每次打开时重置本地副本
watch(show, (val) => {
  if (val) {
    localAiSettings.value = { ...store.state.gomoku.aiSettings }
    localAiPlayer.value = store.state.gomoku.aiPlayer
    localGameSettings.value = { ...store.state.gomoku.gameSettings }
  }
})

// v-model 绑定本地副本
const aiSettings = computed({
  get: () => localAiSettings.value,
  set: (v) => (localAiSettings.value = v),
})
const aiPlayer = computed({
  get: () => localAiPlayer.value,
  set: (v) => (localAiPlayer.value = v),
})
const gameSettings = computed({
  get: () => localGameSettings.value,
  set: (v) => (localGameSettings.value = v),
})

function handleApply() {
  // 只在应用时写入 store
  store.commit('updateAiSettings', { ...aiSettings.value })
  store.commit('updateAiPlayer', aiPlayer.value)
  store.commit('updateGameSettings', { ...gameSettings.value })
  store.commit('setShowAISettings', false)
}
function handleClose() {
  store.commit('setShowAISettings', false)
}
function handleReset() {
  // 重置本地副本为默认
  store.commit('resetAiSettings')
  localAiSettings.value = { ...store.state.gomoku.aiSettings }
}
</script>

<style scoped>
/* 移动端优化 */
@media (max-width: 768px) {
  .grid {
    grid-template-columns: 1fr;
  }

  .grid-cols-2 {
    grid-template-columns: 1fr;
  }

  .lg\:grid-cols-2 {
    grid-template-columns: 1fr;
  }

  .text-xs {
    font-size: 0.65rem;
  }

  .p-2 {
    padding: 0.375rem;
  }

  .gap-2 {
    gap: 0.375rem;
  }

  .rounded {
    border-radius: 0.25rem;
  }

  .max-w-4xl {
    max-width: 95vw;
  }

  .p-6 {
    padding: 1rem;
  }

  .gap-6 {
    gap: 1rem;
  }
}
</style>
