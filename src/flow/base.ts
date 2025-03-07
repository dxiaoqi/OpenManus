import { BaseAgent } from '../agent/base';
import { Message } from '../schema';
import logger from '../utils/logger';

/**
 * 流程类型枚举
 */
export enum FlowType {
  PLANNING = 'planning',
  SEQUENTIAL = 'sequential',
  PARALLEL = 'parallel'
}

/**
 * 基础流程类
 */
export abstract class BaseFlow {
  protected agents: Record<string, BaseAgent> = {};
  protected memory: Message[] = [];

  constructor(agents: Record<string, BaseAgent> = {}) {
    this.agents = agents;
  }

  /**
   * 添加代理
   */
  addAgent(key: string, agent: BaseAgent): void {
    this.agents[key] = agent;
  }

  /**
   * 获取代理
   */
  getAgent(key: string): BaseAgent {
    const agent = this.agents[key];
    if (!agent) {
      throw new Error(`Agent not found: ${key}`);
    }
    return agent;
  }

  /**
   * 执行流程
   */
  abstract execute(input: string): Promise<string>;

  /**
   * 清理资源
   */
  async cleanup(): Promise<void> {
    for (const agent of Object.values(this.agents)) {
      await agent.cleanup();
    }
    this.memory = [];
  }

  /**
   * 更新内存
   */
  protected updateMemory(message: Message): void {
    this.memory.push(message);
  }
} 