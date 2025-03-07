import { BaseFlow } from './base';
import { Message } from '../schema';
import logger from '../utils/logger';
import { BaseAgent } from '../agent';

/**
 * 计划流程类
 */
export class PlanningFlow extends BaseFlow {
  private plannerKey: string;
  private executorKey: string;

  constructor(
    agents: Record<string, BaseAgent>,
    plannerKey: string = 'planner',
    executorKey: string = 'executor'
  ) {
    super(agents);
    this.plannerKey = plannerKey;
    this.executorKey = executorKey;
  }

  /**
   * 执行计划流程
   */
  async execute(input: string): Promise<string> {
    try {
      // 获取代理
      const planner = this.getAgent(this.plannerKey);
      const executor = this.getAgent(this.executorKey);

      // 创建计划
      logger.info('Creating plan...');
      const plan = await planner.run(input);
      this.updateMemory(Message.assistantMessage(plan));

      // 执行计划
      logger.info('Executing plan...');
      const result = await executor.run(plan);
      this.updateMemory(Message.assistantMessage(result));

      return result;
    } catch (error) {
      logger.error('Error in planning flow:', error);
      throw error;
    }
  }
} 