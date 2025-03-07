/**
 * 工具错误类，当工具执行过程中遇到错误时抛出
 */
export class ToolError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ToolError';
  }
} 