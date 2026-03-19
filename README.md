# My Plan AI

一个基于 Expo React Native 的个人 AI 计划助手，面向 iOS 优先场景实现以下核心能力：

- 闪电录入任务，进入本地任务池
- 今日聚焦视图，支持手动 Pin 和 4 点切日逻辑
- 日历查看到期任务与完成回溯
- AI Pet 经验值、等级和情绪反馈
- 通过 Node.js 中转服务接入 GLM，客户端不保存 API Key

## 技术栈

- 客户端：Expo + React Native + TypeScript + Expo Router
- 本地状态：Zustand + AsyncStorage
- UI/交互：react-native-calendars、react-native-confetti-cannon、gesture-handler、expo-haptics
- 服务端：Node.js + Express

## 目录结构

```text
app/                  Expo Router 页面
src/components/       通用 UI 组件
src/features/         任务、AI、宠物等业务模块
src/lib/              日期与主题等基础工具
src/store/            全局状态与持久化
server/               GLM 中转服务
```

## 本地启动

1. 安装依赖

```bash
npm install
```

2. 启动客户端

```bash
npm start
```

3. 启动 AI 中转服务

```bash
npm run server
```

## 环境变量

客户端可选：

```bash
cp .env.example .env
```

可配置项：

- `EXPO_PUBLIC_AI_PROXY_URL`：客户端默认请求的 AI 代理地址

服务端必填：

```bash
cp server/.env.example server/.env
```

可配置项：

- `PORT`：Node 服务端口，默认 `8787`
- `GLM_MODEL`：默认 `glm-5`
- `GLM_API_KEY`：你的 GLM 密钥，只保存在服务端

## AI 调试说明

- 模拟器下可以直接使用 `http://localhost:8787`
- 真机调试时，请把设置页中的代理地址改成你电脑的局域网 IP，例如 `http://192.168.1.10:8787`
- 若服务端未配置 `GLM_API_KEY`，客户端的 AI 按钮会返回明确错误提示，但任务与 XP 主流程不受影响

## 当前已实现

- 任务录入、编辑、状态流转、完成/放弃
- 今日聚焦自动筛选
- 日历视图
- 宠物 XP 与等级面板
- GLM 价值分析与下一步推荐代理接口

## 后续建议

- 增加真实宠物素材与多等级外观
- 加入番茄钟与更细粒度动画
- 进一步补充单元测试和 EAS 构建配置
