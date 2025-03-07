# BaseAgent - 基础代理

## 设计理念

BaseAgent 作为所有代理的基类，提供了：

1. 基础状态管理
2. 消息处理能力
3. 生命周期管理
4. 错误处理机制

## 核心接口

```typescript
export abstract class BaseAgent {
  protected name: string;
  protected description: string;
  protected systemPrompt?: string;
  protected nextStepPrompt?: string;
  protected llm: LLM;
  protected memory: Memory;
  protected state: AgentState;
  
  abstract protected step(): Promise<string>;
  
  async run(request?: string): Promise<string>;
  async initialize(): Promise<void>;
  async cleanup(): Promise<void>;
}
```

## 关键功能

### 1. 状态管理

```typescript
protected state: AgentState = AgentState.IDLE;

async run(request?: string): Promise<string> {
  if (this.state !== AgentState.IDLE) {
    throw new Error(`Cannot run agent from state: ${this.state}`);
  }
  this.state = AgentState.RUNNING;
  // ...
}
```

### 2. 消息处理

```typescript
protected updateMemory(role: MessageRole, content: string): void {
  const message = new Message(role, content);
  this.memory.addMessage(message);
}
```

### 3. 循环检测

```typescript
protected isStuck(): boolean {
  // 检查重复消息
  return this.checkDuplicateMessages() >= this.duplicateThreshold;
}
```

## 扩展指南

创建新的代理类型时：

1. 继承 BaseAgent
2. 实现 step 方法
3. 根据需要重写其他方法

示例：
```typescript
export class CustomAgent extends BaseAgent {
  protected async step(): Promise<string> {
    // 实现具体的步骤逻辑
    return 'Step result';
  }
}
``` 