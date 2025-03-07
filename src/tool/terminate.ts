import { BaseTool } from './base';

/**
 * 终止工具，用于结束代理执行
 */
export class Terminate extends BaseTool {
  constructor() {
    super(
      'terminate',
      'Terminate the current execution and return the final result to the user.',
      {
        type: 'object',
        properties: {
          reason: {
            type: 'string',
            description: 'The reason for termination'
          }
        },
        required: ['reason']
      }
    );
  }

  /**
   * 执行终止操作
   */
  async execute(args: { reason: string }): Promise<string> {
    return `Execution terminated: ${args.reason}`;
  }
} 