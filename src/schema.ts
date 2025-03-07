/**
 * 代理执行状态枚举
 */
export enum AgentState {
  IDLE = 'IDLE',
  RUNNING = 'RUNNING',
  FINISHED = 'FINISHED',
  ERROR = 'ERROR'
}

/**
 * 函数调用接口
 */
export interface Function {
  name: string;
  arguments: string;
}

/**
 * 工具调用接口
 */
export interface ToolCall {
  id: string;
  type: string;
  function: Function;
}

/**
 * 消息角色类型
 */
export type MessageRole = 'system' | 'user' | 'assistant' | 'tool';

/**
 * 消息接口
 */
export class Message {
  role: MessageRole;
  content: string | null;
  toolCalls?: ToolCall[];
  name?: string;
  toolCallId?: string;

  constructor(
    role: MessageRole, 
    content: string | null = null, 
    toolCalls?: ToolCall[], 
    name?: string, 
    toolCallId?: string
  ) {
    this.role = role;
    this.content = content;
    this.toolCalls = toolCalls;
    this.name = name;
    this.toolCallId = toolCallId;
  }

  /**
   * 转换为字典格式
   */
  toDict(): Record<string, any> {
    const message: Record<string, any> = { role: this.role };
    
    if (this.content !== null) {
      message.content = this.content;
    }
    
    if (this.toolCalls) {
      message.toolCalls = this.toolCalls;
    }
    
    if (this.name) {
      message.name = this.name;
    }
    
    if (this.toolCallId) {
      message.toolCallId = this.toolCallId;
    }
    
    return message;
  }

  /**
   * 创建用户消息
   */
  static userMessage(content: string): Message {
    return new Message('user', content);
  }

  /**
   * 创建系统消息
   */
  static systemMessage(content: string): Message {
    return new Message('system', content);
  }

  /**
   * 创建助手消息
   */
  static assistantMessage(content?: string): Message {
    return new Message('assistant', content || null);
  }

  /**
   * 创建工具消息
   */
  static toolMessage(content: string, name: string, toolCallId: string): Message {
    return new Message('tool', content, undefined, name, toolCallId);
  }

  /**
   * 从工具调用创建消息
   */
  static fromToolCalls(toolCalls: ToolCall[], content: string = ''): Message {
    const formattedCalls = toolCalls.map(call => ({
      id: call.id,
      function: call.function,
      type: 'function'
    }));
    
    return new Message('assistant', content, formattedCalls);
  }
}

/**
 * 内存类，用于存储消息历史
 */
export class Memory {
  messages: Message[] = [];
  maxMessages: number = 100;

  /**
   * 添加消息
   */
  addMessage(message: Message): void {
    this.messages.push(message);
    
    // 实现消息限制
    if (this.messages.length > this.maxMessages) {
      this.messages = this.messages.slice(-this.maxMessages);
    }
  }

  /**
   * 添加多条消息
   */
  addMessages(messages: Message[]): void {
    this.messages.push(...messages);
    
    // 实现消息限制
    if (this.messages.length > this.maxMessages) {
      this.messages = this.messages.slice(-this.maxMessages);
    }
  }

  /**
   * 清空所有消息
   */
  clear(): void {
    this.messages = [];
  }

  /**
   * 获取最近的 n 条消息
   */
  getRecentMessages(n: number): Message[] {
    return this.messages.slice(-n);
  }

  /**
   * 转换为字典列表
   */
  toDictList(): Record<string, any>[] {
    return this.messages.map(msg => msg.toDict());
  }
} 