import { BaseTool } from './base';

/**
 * 工具集合类，用于管理多个工具
 */
export class ToolCollection {
  tools: BaseTool[] = [];
  toolMap: Record<string, BaseTool> = {};

  /**
   * 构造函数
   */
  constructor(...tools: BaseTool[]) {
    tools.forEach(tool => this.addTool(tool));
  }

  /**
   * 添加工具
   */
  addTool(tool: BaseTool): void {
    this.tools.push(tool);
    this.toolMap[tool.name] = tool;
  }

  /**
   * 获取工具
   */
  getTool(name: string): BaseTool | undefined {
    return this.toolMap[name];
  }

  /**
   * 执行工具
   */
  async execute(name: string, toolInput: Record<string, any> = {}): Promise<any> {
    const tool = this.getTool(name);
    if (!tool) {
      throw new Error(`Tool not found: ${name}`);
    }
    return await tool.execute(toolInput);
  }

  /**
   * 转换为参数格式
   */
  toParams(): Record<string, any>[] {
    return this.tools.map(tool => tool.toParam());
  }
} 