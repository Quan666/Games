# Games

利用 AI 大模型生成的游戏集合项目，用于实验 AI 辅助编程的效率。目前支持五子棋、象棋，后续计划扩展更多小游戏。

---

## 项目简介

本项目旨在探索 AI 辅助编程的开发效率，集成多种小游戏与 AI 对弈能力，适合 AI 相关学习、前端工程实践及娱乐体验。

## 在线预览

> [点击体验在线 Demo](https://games.shab.fun)  

## 项目说明

- 本项目大部分由 AI 辅助生成，主要使用了 GitHub Copilot（Agent 模式）、Claude Sonnet 4、GPT-4.1 等 AI 模型，开发者对生成内容进行了人工优化和整合。
- Gomoku AI 对弈部分参考并借鉴了以下开源项目：
  - https://github.com/dhbloo/rapfi
  - https://github.com/dhbloo/gomoku-calculator
- 象棋 AI 对弈部分参考并借鉴了以下开源项目：
  - https://github.com/official-pikafish/Pikafish

## 主要特性

- 多种小游戏支持（如五子棋、象棋，后续可扩展）
- 集成 AI 对弈（支持 WebAssembly 加速，AI 引擎本地运行，响应迅速）
- 响应式界面，适配桌面与移动端
- 现代前端技术栈，开发体验优秀

## 技术栈

- [Vue 3](https://vuejs.org/)
- [Vite](https://vitejs.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vue Router](https://router.vuejs.org/)
- [WASM](https://webassembly.org/)（AI 引擎加速）

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

### 环境要求
- Node.js 16+（建议使用 LTS 版本）
- 推荐使用 [pnpm](https://pnpm.io/)、[yarn](https://yarnpkg.com/) 或 npm

### 本地开发

```bash
npm install
npm run dev
```

### 生产打包

```bash
npm run build
```

### 代码格式化

本项目已集成 Prettier 进行代码格式化，建议开发时统一风格：

```bash
npm run format
```

或直接使用 VS Code 的格式化快捷键（如 `Shift+Alt+F`）。

## 常见问题

- AI 引擎加载慢？请确保浏览器支持 WebAssembly，首次加载需等待 wasm 文件下载。
- 如何自定义 AI 难度？可在游戏设置中调整。
- 其他问题欢迎提 issue。

## 贡献指南

欢迎提交 issue 或 PR 参与项目建设！


## 致谢

- 感谢所有开源项目及 AI 社区的支持。
- 特别感谢 [dhbloo/rapfi](https://github.com/dhbloo/rapfi)、[official-pikafish/Pikafish](https://github.com/official-pikafish/Pikafish) 等项目。
