<template>
  <div
    class="chess-piece"
    :class="{
      'black-piece': isBlack,
      'red-piece': !isBlack,
      selected: isSelected,
      'hover-effect': true,
    }"
    :style="{
      left: margin + x * cellSize - 22 * scale + 'px',
      top: margin + y * cellSize - 22 * scale + 'px',
      width: 44 * scale + 'px',
      height: 44 * scale + 'px',
    }"
    @click="$emit('click')"
  >
    <div class="piece-shadow"></div>
    <div class="piece-circle">
      <div class="piece-inner">
        <span class="piece-text">{{ piece.type }}</span>
      </div>
      <div class="piece-highlight"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toRefs } from 'vue'

interface Props {
  piece: {
    type: string
    position: { x: number; y: number }
    id: string
  }
  x: number
  y: number
  isBlack: boolean
  isSelected?: boolean
  cellSize: number
  margin: number
  scale: number
}

const props = defineProps<Props>()

defineEmits<{
  click: []
}>()

// 解构 props 以便在模板中使用
const { piece, x, y, isBlack, isSelected, cellSize, margin, scale } = toRefs(props)
</script>

<style scoped>
.chess-piece {
  position: absolute;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 10;
}

.chess-piece.hover-effect:hover {
  transform: scale(1.08) translateZ(0);
  z-index: 15;
}

.piece-shadow {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.3);
  filter: blur(4px);
  transform: translateY(2px) scale(0.9);
  z-index: -1;
}

.piece-circle {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #333;
  overflow: hidden;
}

.piece-inner {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.piece-highlight {
  position: absolute;
  top: 10%;
  left: 20%;
  width: 30%;
  height: 30%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.4) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
  z-index: 3;
}

.black-piece .piece-circle {
  background: radial-gradient(circle at 35% 35%, #6a6a6a, #2a2a2a, #0a0a0a);
  border-color: #000;
  box-shadow:
    inset 0 2px 4px rgba(255, 255, 255, 0.1),
    inset 0 -2px 4px rgba(0, 0, 0, 0.3),
    0 4px 12px rgba(0, 0, 0, 0.4);
}

.red-piece .piece-circle {
  background: radial-gradient(circle at 35% 35%, #ff4757, #dc2626, #991b1b);
  border-color: #7f1d1d;
  box-shadow:
    inset 0 2px 4px rgba(255, 255, 255, 0.2),
    inset 0 -2px 4px rgba(0, 0, 0, 0.3),
    0 4px 12px rgba(220, 38, 38, 0.4);
}

.piece-text {
  font-size: v-bind('(26 * scale) + "px"');
  font-weight: 900;
  font-family: '楷体', 'KaiTi', '华文楷体', serif;
  text-shadow:
    v-bind('(1 * scale) + "px"') v-bind('(1 * scale) + "px"') 0 rgba(0, 0, 0, 0.8),
    v-bind('(-1 * scale) + "px"') v-bind('(-1 * scale) + "px"') 0 rgba(0, 0, 0, 0.8),
    v-bind('(1 * scale) + "px"') v-bind('(-1 * scale) + "px"') 0 rgba(0, 0, 0, 0.8),
    v-bind('(-1 * scale) + "px"') v-bind('(1 * scale) + "px"') 0 rgba(0, 0, 0, 0.8),
    0 v-bind('(2 * scale) + "px"') v-bind('(4 * scale) + "px"') rgba(0, 0, 0, 0.6);
  user-select: none;
  position: relative;
  z-index: 4;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.black-piece .piece-text {
  color: #ffffff;
}

.red-piece .piece-text {
  color: #ffffff;
}

.chess-piece.selected {
  animation: selected-pulse 1.5s infinite;
  z-index: 20;
}

.chess-piece.selected .piece-circle {
  box-shadow:
    0 0 0 3px rgba(255, 215, 0, 0.8),
    0 0 0 6px rgba(255, 215, 0, 0.4),
    inset 0 2px 4px rgba(255, 255, 255, 0.2),
    inset 0 -2px 4px rgba(0, 0, 0, 0.3),
    0 6px 20px rgba(0, 0, 0, 0.5);
}

@keyframes selected-pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.chess-piece:active {
  transform: scale(0.95);
}

/* 棋子悬停时的光泽效果 */
.chess-piece:hover .piece-highlight {
  opacity: 1.2;
  transform: scale(1.2);
  transition: all 0.3s ease;
}
</style>
