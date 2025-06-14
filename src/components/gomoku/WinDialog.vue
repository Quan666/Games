<template>
  <!-- 胜利弹窗 -->
  <div
    v-if="show"
    class="fixed top-0 left-0 right-0 text-white py-4 px-6 text-center font-bold text-lg z-50 shadow-lg"
    :class="
      winnerText === '和局'
        ? 'bg-gradient-to-r from-gray-500 to-gray-600'
        : 'bg-gradient-to-r from-green-500 to-green-600'
    "
  >
    <span v-if="winnerText === '和局'">🤝 {{ winnerText }}！</span>
    <span v-else>🎉 {{ winnerText }}获胜！</span>
  </div>
</template>

<script setup lang="ts">
// Props
defineProps<{
  show: boolean
  winnerText: string
}>()
</script>
