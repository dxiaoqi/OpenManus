import { BaseAgent, AgentConfig, AgentContext } from './base';
import { AgentState } from '../schema';
import logger from '../utils/logger';

export interface TextAgentConfig extends AgentConfig {
  maxLength?: number;
  language?: string;
}

export class TextAgent extends BaseAgent {
  private maxLength: number;
  private language: string;

  constructor(config: TextAgentConfig, context: AgentContext = {}) {
    super(config, context);
    this.maxLength = config.maxLength || 1000;
    this.language = config.language || 'en';
  }

  async initialize(): Promise<void> {
    await super.initialize();
    logger.info(`Initialized TextAgent with language: ${this.language}`);
  }

  /**
   * 执行单个步骤
   */
  protected async step(): Promise<string> {
    const messages = this.memory.messages;
    if (messages.length === 0) {
      return 'No input to process';
    }

    const lastMessage = messages[messages.length - 1];
    if (!lastMessage.content) {
      return 'Empty input';
    }

    // 处理文本
    let result = lastMessage.content;
    
    // 截断文本到最大长度
    if (result.length > this.maxLength) {
      result = result.substring(0, this.maxLength) + '...';
    }

    // 添加处理结果到内存
    this.updateMemory('assistant', result);

    // 完成处理
    this.state = AgentState.FINISHED;
    
    return result;
  }
} 