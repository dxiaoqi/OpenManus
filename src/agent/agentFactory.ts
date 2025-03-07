import { BaseAgent, AgentConfig, AgentContext } from './base';
import { TextAgent, TextAgentConfig } from './textAgent';
import { DataAgent, DataAgentConfig } from './dataAgent';
import { Manus } from './manus';
import { ToolCallAgent } from './toolCallAgent';

// 代理类型枚举
export enum AgentType {
  TEXT = 'text',
  DATA = 'data',
  MANUS = 'manus',
  TOOL_CALL = 'toolcall',
  // 将来可以添加更多代理类型
}

// 代理工厂类
export class AgentFactory {
  /**
   * 创建一个新的代理实例
   * @param type 代理类型
   * @param config 代理配置
   * @param context 代理上下文
   * @returns 新创建的代理实例
   */
  static createAgent(
    type: AgentType,
    config: AgentConfig,
    context: AgentContext = {}
  ): BaseAgent {
    switch (type) {
      case AgentType.TEXT:
        return new TextAgent(config as TextAgentConfig, context);
      
      case AgentType.DATA:
        return new DataAgent(config as DataAgentConfig, context);
      
      case AgentType.MANUS:
        return new Manus();
      
      case AgentType.TOOL_CALL:
        return new ToolCallAgent();
      
      default:
        throw new Error(`Unknown agent type: ${type}`);
    }
  }
} 