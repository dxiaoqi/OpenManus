/**
 * 工具基类
 */
export abstract class BaseTool {
  name: string;
  description: string;
  parameters?: Record<string, any>;

  constructor(name: string, description: string, parameters?: Record<string, any>) {
    this.name = name;
    this.description = description;
    this.parameters = parameters;
  }

  /**
   * 执行工具
   */
  async execute(...args: any[]): Promise<any> {
    throw new Error('Method not implemented');
  }

  /**
   * 转换为参数格式
   */
  toParam(): Record<string, any> {
    return {
      type: 'function',
      function: {
        name: this.name,
        description: this.description,
        parameters: this.parameters
      }
    };
  }
}

/**
 * 工具执行结果
 */
export class ToolResult {
  output: any;
  error?: string;
  system?: string;

  constructor(output: any = null, error?: string, system?: string) {
    this.output = output;
    this.error = error;
    this.system = system;
  }

  /**
   * 转换为布尔值
   */
  valueOf(): boolean {
    return !!(this.output || this.error || this.system);
  }

  /**
   * 合并结果
   */
  add(other: ToolResult): ToolResult {
    const combineFields = (field?: string, otherField?: string, concatenate: boolean = true): string | undefined => {
      if (field && otherField) {
        if (concatenate) {
          return field + otherField;
        }
        throw new Error('Cannot combine tool results');
      }
      return field || otherField;
    };

    return new ToolResult(
      this.output || other.output,
      combineFields(this.error, other.error),
      combineFields(this.system, other.system)
    );
  }

  /**
   * 转换为字符串
   */
  toString(): string {
    return this.error ? `Error: ${this.error}` : String(this.output);
  }

  /**
   * 替换字段
   */
  replace(fields: Partial<ToolResult>): ToolResult {
    return new ToolResult(
      fields.output !== undefined ? fields.output : this.output,
      fields.error !== undefined ? fields.error : this.error,
      fields.system !== undefined ? fields.system : this.system
    );
  }
}

/**
 * CLI 结果类
 */
export class CLIResult extends ToolResult {}

/**
 * 工具失败结果类
 */
export class ToolFailure extends ToolResult {}

/**
 * 代理感知工具接口
 */
export interface AgentAwareTool {
  agent?: any;
} 