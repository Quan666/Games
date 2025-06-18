// 配置管理器 - 监听store配置变化并应用到AI引擎

import type { Store } from 'vuex'
import type { AIManager } from './AIManager'

export interface AIConfigWatcher {
  redAIManager?: AIManager
  blackAIManager?: AIManager
  store: Store<any>
  unsubscribe?: () => void
}

export class AIConfigManager {
  private watchers: AIConfigWatcher[] = []

  /**
   * 注册AI配置监听器
   */
  registerWatcher(watcher: AIConfigWatcher): void {
    this.watchers.push(watcher)
    
    // 监听store配置变化
    const unsubscribe = watcher.store.watch(
      (state) => state.chess.gameConfig,
      (newConfig, oldConfig) => {
        this.handleConfigChange(watcher, newConfig, oldConfig)
      },
      { deep: true, immediate: true }
    )
    
    watcher.unsubscribe = unsubscribe
  }

  /**
   * 取消注册监听器
   */
  unregisterWatcher(watcher: AIConfigWatcher): void {
    const index = this.watchers.indexOf(watcher)
    if (index > -1) {
      this.watchers.splice(index, 1)
      if (watcher.unsubscribe) {
        watcher.unsubscribe()
      }
    }
  }

  /**
   * 处理配置变化
   */
  private handleConfigChange(watcher: AIConfigWatcher, newConfig: any, oldConfig: any): void {
    const { store } = watcher

    // 获取当前游戏模式
    const gameMode = newConfig.gameMode

    if (gameMode === 'ai-vs-ai') {
      // AI对战模式 - 为红黑双方分别应用配置
      this.applyAiVsAiConfig(watcher, store)
    } else if (gameMode === 'pve') {
      // 人机模式 - 应用公共配置
      this.applyPveConfig(watcher, store)
    }
  }

  /**
   * 应用AI对战配置
   */
  private applyAiVsAiConfig(watcher: AIConfigWatcher, store: Store<any>): void {
    // 获取红方完整配置
    const redConfig = store.getters['chess/getRedAiFullConfig']
    if (watcher.redAIManager && redConfig) {
      console.log('应用红方AI配置:', redConfig)
      watcher.redAIManager.updateConfig(redConfig)
    }

    // 获取黑方完整配置
    const blackConfig = store.getters['chess/getBlackAiFullConfig']
    if (watcher.blackAIManager && blackConfig) {
      console.log('应用黑方AI配置:', blackConfig)
      watcher.blackAIManager.updateConfig(blackConfig)
    }
  }

  /**
   * 应用人机配置
   */
  private applyPveConfig(watcher: AIConfigWatcher, store: Store<any>): void {
    // 人机模式只有一个AI实例
    const aiConfig = store.getters['chess/getCurrentAiConfig']
    const aiManager = watcher.redAIManager || watcher.blackAIManager
    
    if (aiManager && aiConfig) {
      console.log('应用人机AI配置:', aiConfig)
      aiManager.updateConfig(aiConfig)
    }
  }

  /**
   * 获取指定方的完整配置（公共 + 特定配置）
   */
  static getFullConfig(store: Store<any>, side: 'red' | 'black'): any {
    const commonConfig = store.state.chess.gameConfig.aiConfig || {}
    const specificConfig = side === 'red' 
      ? store.state.chess.gameConfig.aiVsAiConfig?.redAI || {}
      : store.state.chess.gameConfig.aiVsAiConfig?.blackAI || {}
    
    return { ...commonConfig, ...specificConfig }
  }

  /**
   * 更新指定方的非公共配置
   */
  static updateSideConfig(store: Store<any>, side: 'red' | 'black', config: any): void {
    const mutation = side === 'red' ? 'chess/updateRedAiConfig' : 'chess/updateBlackAiConfig'
    store.commit(mutation, config)
  }

  /**
   * 清理所有监听器
   */
  cleanup(): void {
    this.watchers.forEach(watcher => {
      if (watcher.unsubscribe) {
        watcher.unsubscribe()
      }
    })
    this.watchers = []
  }
}

// 导出单例实例
export const aiConfigManager = new AIConfigManager()
