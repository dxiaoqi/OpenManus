import { BaseTool } from './base';
import logger from '../utils/logger';

/**
 * Google 搜索工具
 */
export class GoogleSearch extends BaseTool {
  constructor() {
    super(
      'google_search',
      'Search information using Google',
      {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'The search query'
          },
          numResults: {
            type: 'number',
            description: 'Number of results to return (optional)',
            default: 5
          }
        },
        required: ['query']
      }
    );
  }

  async execute(args: { query: string; numResults?: number }): Promise<string> {
    try {
      const { query, numResults = 5 } = args;
      logger.info(`Searching Google for: ${query}`);

      // 构建搜索 URL
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
      
      // 返回搜索结果
      return `Search URL: ${searchUrl}\nPlease use browser_use tool to open this URL and extract information.`;
    } catch (error) {
      logger.error('Error in Google search:', error);
      return `Error performing Google search: ${error}`;
    }
  }
} 