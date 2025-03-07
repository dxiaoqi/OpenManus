import { BaseAgent, AgentConfig, AgentContext } from './base';
import { AgentState } from '../schema';

/**
 * ReAct 代理基类
 */
export abstract class ReActAgent extends BaseAgent {
  /**
   * 构造函数
   */
  constructor(config: AgentConfig, context: AgentContext = {}) {
    super(config, context);
  }

  /**
   * 思考过程
   */
  protected abstract think(): Promise<boolean>;

  /**
   * 执行动作
   */
  protected abstract act(): Promise<string>;

  /**
   * 执行单个步骤：思考和行动
   */
  protected async step(): Promise<string> {
    const shouldAct = await this.think();
    
    if (!shouldAct) {
      return 'Thinking complete - no action needed';
    }
    
    return await this.act();
  }
} 