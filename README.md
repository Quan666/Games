# Games

利用 AI 大模型生成的游戏集合项目，用于实验 AI 辅助编程的效率。目前仅支持五子棋（AI 对战）。

## 项目说明

- 本项目大部分由 AI 辅助生成，主要使用了 GitHub Copilot（Agent 模式）和 Claude Sonnet 4、GPT-4.1 等 AI 模型，开发者对生成内容进行了人工优化和整合。
- Gomoku AI 对弈部分参考并借鉴了以下开源项目：
  - https://github.com/dhbloo/rapfi
  - https://github.com/dhbloo/gomoku-calculator

## 主要特性

- 多种小游戏支持（如五子棋）
- 集成 AI 对弈（支持 wasm 加速）
- 响应式界面，适配多端
- 现代前端技术栈，开发体验优秀

## 技术栈

- [Vue 3](https://vuejs.org/)
- [Vite](https://vitejs.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vue Router](https://router.vuejs.org/)

## 目录结构

```
├── public/                # 静态资源与 AI wasm 文件
├── src/                   # 源码目录
│   ├── api/               # API 封装
│   ├── assets/            # 静态资源
│   ├── components/        # 组件
│   ├── router/            # 路由
│   ├── store/             # 状态管理
│   ├── styles/            # 样式
│   ├── utils/             # 工具函数
│   └── views/             # 页面视图
├── index.html             # 入口 HTML
├── package.json           # 项目依赖与脚本
├── tsconfig.json          # TypeScript 配置
├── vite.config.ts         # Vite 配置
```

## 安装与运行

1. 安装依赖：
   ```powershell
   npm install
   ```
2. 启动开发服务器：
   ```powershell
   npm run dev
   ```
3. 打包生产环境：
   ```powershell
   npm run build
   ```

## 代码格式化

本项目已集成 Prettier 进行代码格式化，建议开发时统一风格：

```powershell
npm run format
```

或直接使用 VS Code 的格式化快捷键（如 `Shift+Alt+F`）。

## 贡献指南

欢迎提交 issue 或 PR 参与项目建设！
