import { FlowFactory, FlowType } from '../flow';
import { PlanningAgent } from '../agent/planningAgent';
import { Manus } from '../agent/manus';
import logger from '../utils/logger';

async function main() {
  try {
    // 创建代理
    const planner = new PlanningAgent();
    const executor = new Manus();

    // 初始化代理
    await planner.initialize();
    await executor.initialize();

    // 创建流程
    const flow = FlowFactory.createFlow(
      FlowType.PLANNING,
      {
        planner,
        executor
      }
    );

    // 执行流程
    const result = await flow.execute(
      '请帮我规划一个杭州三日游行程'
    );

    logger.info('Flow result:', result);

    // 清理资源
    await flow.cleanup();
  } catch (error) {
    logger.error('Error:', error);
  }
}

main(); 