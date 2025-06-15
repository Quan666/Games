<template>
  <div class="chinese-chess-game">
    <div class="game-header">
      <h2>中国象棋</h2>
      <div class="game-status">
        <div class="status-text">{{ gameStatusText }}</div>
        <div
          class="current-player-indicator"
          :class="{ red: currentPlayer === 'red', black: currentPlayer === 'black' }"
        >
          <div class="player-circle"></div>
          <span class="player-text">{{ currentPlayer === 'red' ? '红方' : '黑方' }}</span>
        </div>
      </div>
      <div class="game-controls">
        <button @click="toggleSound" class="sound-btn" :class="{ active: soundEnabled }">
          {{ soundEnabled ? '🔊' : '🔇' }}
        </button>
        <button @click="toggleVoice" class="voice-btn" :class="{ active: voiceEnabled }">
          {{ voiceEnabled ? '🗣️' : '🔇' }}
        </button>
        <button @click="resetGame" class="reset-btn">重新开始</button>
        <button @click="toggleHistory" class="history-btn">
          {{ showMoveHistory ? '隐藏' : '显示' }}历史
        </button>
      </div>
    </div>

    <div class="game-content">
      <div
        class="board-container"
        :class="{ 'red-turn': currentPlayer === 'red', 'black-turn': currentPlayer === 'black' }"
      >
        <ChessBoard
          ref="chessBoardRef"
          @game-status-change="onGameStatusChange"
          @player-change="onPlayerChange"
          @move-performed="onMovePerformed"
          @piece-selected="onPieceSelected"
        />
      </div>

      <div v-if="showMoveHistory" class="move-history">
        <h3>走法历史</h3>
        <div class="history-list">
          <div v-for="(move, index) in moveHistory" :key="index" class="move-item">
            <span class="move-number">{{ index + 1 }}.</span>
            <span class="move-text">
              {{ formatMove(move) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 游戏结束对话框 -->
    <div v-if="gameStatus !== 'playing'" class="game-over-modal">
      <div class="modal-content">
        <h3>游戏结束</h3>
        <p>{{ gameStatusText }}</p>
        <div class="modal-actions">
          <button @click="resetGame" class="primary-btn">重新开始</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import ChessBoard from './board/ChessBoard.vue'
import { createChessSoundGenerator } from './ChessSound'
import type { Move } from './ChessGame'

const chessBoardRef = ref()
const showMoveHistory = ref(true)
const gameStatus = ref('playing')
const currentPlayer = ref('red')
const moveHistory = ref<Move[]>([])
const soundEnabled = ref(true)
const voiceEnabled = ref(true)

// 音效管理器
const soundGenerator = createChessSoundGenerator(() => soundEnabled.value)

const gameStatusText = computed(() => {
  return chessBoardRef.value?.getGameStatusText() || ''
})

const onGameStatusChange = (status: string) => {
  gameStatus.value = status

  // 播放游戏结束音效
  if (status === 'checkmate') {
    // 当前玩家输了，对手赢了
    // const winner = currentPlayer.value === 'red' ? 'black' : 'red'
    soundGenerator.playGameOverSound(false) // 当前玩家失败
  }
}

const onPlayerChange = (player: string) => {
  currentPlayer.value = player
}

const onMovePerformed = async (moveData: any) => {
  // 添加到历史记录
  if (moveData.move) {
    moveHistory.value.push(moveData.move)
  }

  // 播放相应音效和语音
  if (moveData.isCheck) {
    await soundGenerator.playCheckSound()
  } else if (moveData.isCapture) {
    await soundGenerator.playCaptureSound(moveData.capturedPieceType)
  } else {
    await soundGenerator.playMoveSound()
  }
}

const onPieceSelected = async () => {
  await soundGenerator.playSelectSound()
}

const resetGame = async () => {
  await soundGenerator.playButtonClick()
  chessBoardRef.value?.resetGame()
  gameStatus.value = 'playing'
  currentPlayer.value = 'red'
  moveHistory.value = []
}

const toggleHistory = async () => {
  await soundGenerator.playButtonClick()
  showMoveHistory.value = !showMoveHistory.value
}

const toggleSound = async () => {
  soundEnabled.value = !soundEnabled.value
  await soundGenerator.playButtonClick()
}

const toggleVoice = async () => {
  voiceEnabled.value = !voiceEnabled.value
  soundGenerator.setVoiceEnabled(voiceEnabled.value)
  await soundGenerator.playButtonClick()
}

const formatMove = (move: Move) => {
  const fromPos = `${move.from.x + 1}${10 - move.from.y}`
  const toPos = `${move.to.x + 1}${10 - move.to.y}`
  const captureText = move.capturedPiece ? `吃${move.capturedPiece.type}` : ''
  return `${move.piece.type} ${fromPos}→${toPos} ${captureText}`.trim()
}

onMounted(async () => {
  // 确保音频上下文在用户交互后激活
  await soundGenerator.resumeAudioContext()
  // 设置初始语音状态
  soundGenerator.setVoiceEnabled(voiceEnabled.value)
})
</script>

<style scoped>
.chinese-chess-game {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  background: linear-gradient(135deg, #f4e4bc, #e6d5a8);
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.game-header h2 {
  margin: 0;
  color: #8b4513;
  font-size: 24px;
}

.game-status {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.status-text {
  font-size: 16px;
  color: #333;
  margin-bottom: 5px;
}

.current-player-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: bold;
  font-size: 14px;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.current-player-indicator.red {
  background: linear-gradient(135deg, #dc3545, #a71e2a);
  color: white;
  border-color: #dc3545;
  box-shadow: 0 0 15px rgba(220, 53, 69, 0.4);
}

.current-player-indicator.black {
  background: linear-gradient(135deg, #4a4a4a, #1a1a1a);
  color: white;
  border-color: #4a4a4a;
  box-shadow: 0 0 15px rgba(74, 74, 74, 0.4);
}

.player-circle {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: currentColor;
  animation: pulse-player 2s infinite;
}

@keyframes pulse-player {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.2);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.game-controls {
  display: flex;
  gap: 10px;
  align-items: center;
}

.reset-btn,
.history-btn,
.sound-btn,
.voice-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
  font-weight: 500;
}

.sound-btn,
.voice-btn {
  padding: 8px 12px;
  font-size: 16px;
  background: #17a2b8;
  color: white;
  min-width: 40px;
}

.sound-btn:hover,
.voice-btn:hover {
  background: #138496;
  transform: scale(1.05);
}

.sound-btn.active,
.voice-btn.active {
  background: #28a745;
}

.sound-btn.active:hover,
.voice-btn.active:hover {
  background: #218838;
}

.reset-btn {
  background: #dc3545;
  color: white;
}

.reset-btn:hover {
  background: #c82333;
  transform: translateY(-1px);
}

.history-btn {
  background: #6c757d;
  color: white;
}

.history-btn:hover {
  background: #5a6268;
  transform: translateY(-1px);
}

.game-content {
  display: flex;
  gap: 30px;
  align-items: flex-start;
}

.board-container {
  flex-shrink: 0;
  transition: all 0.5s ease;
  position: relative;
}

.board-container::before {
  content: '';
  position: absolute;
  top: -5px;
  left: -5px;
  right: -5px;
  bottom: -5px;
  border-radius: 20px;
  background: transparent;
  transition: all 0.5s ease;
  z-index: -1;
}

.board-container.red-turn::before {
  background: linear-gradient(
    45deg,
    rgba(220, 53, 69, 0.3) 0%,
    rgba(220, 53, 69, 0.1) 50%,
    rgba(220, 53, 69, 0.3) 100%
  );
  box-shadow: 0 0 30px rgba(220, 53, 69, 0.4);
}

.board-container.black-turn::before {
  background: linear-gradient(
    45deg,
    rgba(74, 74, 74, 0.3) 0%,
    rgba(74, 74, 74, 0.1) 50%,
    rgba(74, 74, 74, 0.3) 100%
  );
  box-shadow: 0 0 30px rgba(74, 74, 74, 0.4);
}

.move-history {
  flex: 1;
  max-width: 300px;
  background: #f8f9fa;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.move-history h3 {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 18px;
}

.history-list {
  max-height: 500px;
  overflow-y: auto;
}

.move-item {
  padding: 8px;
  border-bottom: 1px solid #e9ecef;
  font-size: 14px;
}

.move-item:last-child {
  border-bottom: none;
}

.move-number {
  font-weight: bold;
  color: #6c757d;
  margin-right: 8px;
}

.move-text {
  color: #333;
}

.game-over-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 15px;
  text-align: center;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  max-width: 400px;
}

.modal-content h3 {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 20px;
}

.modal-content p {
  margin: 0 0 20px 0;
  color: #666;
  font-size: 16px;
}

.modal-actions {
  display: flex;
  justify-content: center;
}

.primary-btn {
  padding: 10px 20px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  transition: background 0.2s ease;
}

.primary-btn:hover {
  background: #0056b3;
}

@media (max-width: 768px) {
  .game-content {
    flex-direction: column;
  }

  .move-history {
    max-width: none;
    order: -1;
  }

  .game-header {
    flex-direction: column;
    gap: 15px;
  }
}
</style>
