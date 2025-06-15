<template>
  <div v-if="show" class="fixed inset-0 z-60 flex items-center justify-center bg-black/30">
    <div class="bg-white rounded-xl shadow-xl p-6 w-full max-w-xs mx-4 text-center relative">
      <div class="text-lg font-semibold mb-4">
        <slot name="title">提示</slot>
      </div>
      <div class="mb-6 text-gray-700">
        <slot>确定要执行此操作吗？</slot>
      </div>
      <div class="flex justify-center gap-4">
        <button
          @click="$emit('cancel')"
          class="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700"
        >
          取消
        </button>
        <button
          @click="$emit('confirm')"
          class="px-4 py-2 rounded bg-blue-500 hover:bg-blue-600 text-white"
        >
          确定
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ show: boolean }>()
defineEmits(['confirm', 'cancel'])
</script>

<style scoped>
.z-60 {
  z-index: 60;
}
</style>
