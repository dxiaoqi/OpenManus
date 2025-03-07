<p align="left">
    中文&nbsp ｜ &nbsp<a href="README.md">English</a>&nbsp
</p>

<p align="left">
    <a href="https://discord.gg/6dn7Sa3a"><img src="https://dcbadge.vercel.app/api/server/DYn29wFk9z?style=flat" alt="Discord Follow"></a>
</p>

# AI 代理系统

基于 TypeScript 实现的 AI 代理系统，支持多种代理类型和工具集成。

## 特性

- 🤖 多种代理类型
  - 基础代理
  - ReAct 代理
  - 工具调用代理
  - Manus 通用代理
  - 搜索代理
  - 文本处理代理
  - 数据处理代理

- 🛠️ 可扩展工具
  - 聊天完成
  - Google 搜索
  - 浏览器交互
  - 文件操作
  - 自定义工具支持

- 🔄 流程管理
  - 计划流程
  - 顺序流程
  - 并行流程（即将推出）

- 🎯 核心能力
  - 消息管理
  - 状态控制
  - 错误处理
  - 资源清理

## 安装

```bash
# 安装依赖
npm install

# 构建项目
npm run build

# 运行测试
npm test
```

## 快速开始

```typescript
import { Manus } from './agent/manus';
import logger from './utils/logger';

async function main() {
  try {
    // 创建代理实例
    const agent = new Manus();
    await agent.initialize();

    // 运行代理
    const result = await agent.run(
      '请介绍一下太阳系'
    );

    logger.info(`结果: ${result}`);
    await agent.cleanup();
  } catch (error) {
    logger.error('错误:', error);
  }
}

main();
```

## 配置

创建 `config/config.json` 文件：

```json
{
  "llm": {
    "model": "gpt-4",
    "baseUrl": "https://api.openai.com/v1",
    "apiKey": "你的API密钥",
    "maxTokens": 4096,
    "temperature": 0.7
  }
}
```

## 文档

- [技术设计](docs/technical-design.md)
- [代理系统](docs/agents/README.md)
- [工具系统](docs/tools/README.md)
- [流程系统](docs/flows/README.md)

## 示例

查看 `src/examples` 目录获取更多使用示例：

- 基础代理使用
- 搜索代理
- 计划流程
- 自定义工具创建

## 开发

### 项目结构

```
src/
├── agent/        # 代理实现
├── tool/         # 工具实现
├── flow/         # 流程管理
├── prompt/       # 系统提示词
├── schema/       # 数据模型
├── utils/        # 工具函数
└── examples/     # 使用示例
```

### 创建新代理

```typescript
import { BaseAgent } from './agent/base';

export class CustomAgent extends BaseAgent {
  protected async step(): Promise<string> {
    // 实现步骤逻辑
    return '步骤结果';
  }
}
```

### 添加新工具

```typescript
import { BaseTool } from './tool/base';

export class CustomTool extends BaseTool {
  constructor() {
    super('custom_tool', '工具描述', {
      // 工具参数模式
    });
  }

  async execute(args: any): Promise<any> {
    // 实现工具逻辑
  }
}
```

## 贡献

1. Fork 仓库
2. 创建特性分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证

MIT

## 项目演示  

<video src="https://private-user-images.githubusercontent.com/61239030/420168772-6dcfd0d2-9142-45d9-b74e-d10aa75073c6.mp4?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NDEzMTgwNTksIm5iZiI6MTc0MTMxNzc1OSwicGF0aCI6Ii82MTIzOTAzMC80MjAxNjg3NzItNmRjZmQwZDItOTE0Mi00NWQ5LWI3NGUtZDEwYWE3NTA3M2M2Lm1wND9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUFLSUFWQ09EWUxTQTUzUFFLNFpBJTJGMjAyNTAzMDclMkZ1cy1lYXN0LTElMkZzMyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjUwMzA3VDAzMjIzOVomWC1BbXotRXhwaXJlcz0zMDAmWC1BbXotU2lnbmF0dXJlPTdiZjFkNjlmYWNjMmEzOTliM2Y3M2VlYjgyNDRlZDJmOWE3NWZhZjE1MzhiZWY4YmQ3NjdkNTYwYTU5ZDA2MzYmWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0In0.UuHQCgWYkh0OQq9qsUWqGsUbhG3i9jcZDAMeHjLt5T4" data-canonical-src="https://private-user-images.githubusercontent.com/61239030/420168772-6dcfd0d2-9142-45d9-b74e-d10aa75073c6.mp4?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NDEzMTgwNTksIm5iZiI6MTc0MTMxNzc1OSwicGF0aCI6Ii82MTIzOTAzMC80MjAxNjg3NzItNmRjZmQwZDItOTE0Mi00NWQ5LWI3NGUtZDEwYWE3NTA3M2M2Lm1wND9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUFLSUFWQ09EWUxTQTUzUFFLNFpBJTJGMjAyNTAzMDclMkZ1cy1lYXN0LTElMkZzMyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjUwMzA3VDAzMjIzOVomWC1BbXotRXhwaXJlcz0zMDAmWC1BbXotU2lnbmF0dXJlPTdiZjFkNjlmYWNjMmEzOTliM2Y3M2VlYjgyNDRlZDJmOWE3NWZhZjE1MzhiZWY4YmQ3NjdkNTYwYTU5ZDA2MzYmWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0In0.UuHQCgWYkh0OQq9qsUWqGsUbhG3i9jcZDAMeHjLt5T4" controls="controls" muted="muted" class="d-block rounded-bottom-2 border-top width-fit" style="max-height:640px; min-height: 200px"></video>


## 贡献指南
我们欢迎任何友好的建议和有价值的贡献！可以直接创建 issue 或提交 pull request。

或通过📧邮件联系 @mannaandpoem：mannaandpoem@gmail.com

## 发展路线
- [ ] 更优的规划系统
- [ ] 实时演示功能
- [ ] 运行回放
- [ ] 强化学习微调模型
- [ ] 全面的性能基准测试

<!-- ## 交流群
加入我们的交流群，与其他开发者分享经验！

<div align="center" style="display: flex; gap: 20px;">
    <img src="assets/community_group_9.jpg" alt="OpenManus 交流群9" width="300" />
    <img src="assets/community_group_10.jpg" alt="OpenManus 交流群10" width="300" />
</div> -->

## Star 数量

[![Star History Chart](https://api.star-history.com/svg?repos=mannaandpoem/OpenManus&type=Date)](https://star-history.com/#mannaandpoem/OpenManus&Date)

## 致谢

特别感谢 [anthropic-computer-use](https://github.com/anthropics/anthropic-quickstarts/tree/main/computer-use-demo) 和 [broswer-use](https://github.com/browser-use/browser-use) 为本项目提供的基础支持！

OpenManus 由 MetaGPT 社区的贡献者共同构建，感谢这个充满活力的智能体开发者社区！
