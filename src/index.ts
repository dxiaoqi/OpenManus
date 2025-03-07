import { AgentFactory, AgentType } from './agent/agentFactory';
import { Manus } from './agent/manus';
import logger from './utils/logger';
import { delay, generateId } from './utils';

async function main() {
  const sessionId = generateId();
  logger.info(`Starting agent session: ${sessionId}`);

  try {
    // 创建 Manus 代理实例
    const agent = new Manus();

    // 初始化代理
    await agent.initialize();
    logger.info(`Agent initialized: ${agent.getName()}`);

    // 模拟一些处理延迟
    logger.info('Processing input...');
    // await delay(1000);

    // 运行代理
    const result = await agent.run(
      '请帮我生成一根杭州3月1日旅游攻略，希望可以以markdown格式输出，中文'
      //'Tell me about the solar system and its planets. Keep the response concise.'
    );

    logger.info('Processing complete');
    logger.info(`Result: ${result}`);

    // 清理资源
    await agent.cleanup();
    logger.info(`Session ${sessionId} completed`);
  } catch (error) {
    logger.error('Error in main execution:', error);
    throw error;
  }
}

// 运行主函数
main().catch(error => {
  logger.error('Error in main execution:', error);
  process.exit(1);
}); 