import { BaseFlow, FlowType } from './base';
import { BaseAgent } from '../agent/base';
import { PlanningFlow } from './planningFlow';
import logger from '../utils/logger';

/**
 * 流程工厂类
 */
export class FlowFactory {
  /**
   * 创建流程
   */
  static createFlow(
    type: FlowType,
    agents: Record<string, BaseAgent>,
    options: Record<string, any> = {}
  ): BaseFlow {
    logger.info(`Creating flow of type: ${type}`);

    switch (type) {
      case FlowType.PLANNING:
        return new PlanningFlow(
          agents,
          options.plannerKey,
          options.executorKey
        );
      
      // 可以添加其他流程类型
      
      default:
        throw new Error(`Unknown flow type: ${type}`);
    }
  }
} 