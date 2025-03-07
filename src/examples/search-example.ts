import { SearchAgent } from '../agent/searchAgent';
import logger from '../utils/logger';

async function main() {
  try {
    // 创建搜索代理
    const agent = new SearchAgent();
    await agent.initialize();

    // 执行搜索
    const result = await agent.run(
      '请帮我搜索杭州西湖最佳旅游季节，并总结主要景点信息'
    );

    logger.info('Search Results:', result);
  } catch (error) {
    logger.error('Error:', error);
  }
}

main(); 