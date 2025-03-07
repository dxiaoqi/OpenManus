import { ReActAgent } from './reactAgent';
import { AgentConfig, AgentContext } from './base';
import { AgentState, Message, ToolCall } from '../schema';
import { CreateChatCompletion } from '../tool/createChatCompletion';
import { Terminate } from '../tool/terminate';
import { ToolCollection } from '../tool/toolCollection';
import logger  from '../utils/logger';
import { BaseTool } from '../tool/base';

const TOOL_CALL_REQUIRED = 'Tool calls required but none provided';

/**
 * 工具调用代理类
 */
export class ToolCallAgent extends ReActAgent {
  protected toolChoices: 'none' | 'auto' | 'required' = 'auto';
  protected specialToolNames: string[] = ['terminate'];
  protected toolCalls: ToolCall[] = [];
  protected availableTools: ToolCollection;

  /**
   * 构造函数
   */
  constructor(config: AgentConfig = { name: 'toolcall' }, context: AgentContext = {}) {
    super({
      ...config,
      description: config.description || 'an agent that can execute tool calls.',
      systemPrompt: config.systemPrompt || 'You are an agent that can execute tool calls',
      nextStepPrompt: config.nextStepPrompt || 'If you want to stop interaction, use `terminate` tool/function call.',
      maxSteps: config.maxSteps || 30
    }, context);
    
    // 初始化工具集合
    this.availableTools = new ToolCollection();
    
    // 添加基本工具
    this.availableTools.addTool(new CreateChatCompletion());
    this.availableTools.addTool(new Terminate());

    // 添加额外的工具（如果有的话）
    if (context.tools) {
      context.tools.forEach((tool: BaseTool) => this.availableTools.addTool(tool));
    }
  }

  /**
   * 添加工具
   */
  addTool(tool: BaseTool): void {
    this.availableTools.addTool(tool);
  }

  /**
   * 思考过程
   */
  protected async think(): Promise<boolean> {
    if (this.nextStepPrompt) {
      const userMsg = Message.userMessage(this.nextStepPrompt);
      this.memory.addMessage(userMsg);
    }

    // 获取带工具选项的响应
    const response = await this.llm.askTool(
      this.memory.messages,
      this.systemPrompt ? [Message.systemMessage(this.systemPrompt)] : undefined,
      60,
      this.availableTools.toParams(),
      this.toolChoices
    );
    
    this.toolCalls = response.tool_calls || [];

    // 记录响应信息
    logger.info(`✨ ${this.name}'s thoughts: ${response.content}`);
    logger.info(`🛠️ ${this.name} selected ${this.toolCalls.length || 0} tools to use`);
    
    if (this.toolCalls.length > 0) {
      logger.info(`🧰 Tools being prepared: ${this.toolCalls.map(call => call.function.name)}`);
    }

    try {
      // 处理不同的工具选择模式
      if (this.toolChoices === 'none') {
        if (this.toolCalls.length > 0) {
          logger.warning(`🤔 Hmm, ${this.name} tried to use tools when they weren't available!`);
        }
        
        if (response.content) {
          this.memory.addMessage(Message.assistantMessage(response.content));
        }
        
        return false;
      } else if (this.toolChoices === 'required' && this.toolCalls.length === 0) {
        logger.warning('🚫 Tool calls required but none provided');
        this.memory.addMessage(Message.assistantMessage(TOOL_CALL_REQUIRED));
        return false;
      } else {
        // 正常处理工具调用
        if (response.content || this.toolCalls.length > 0) {
          const assistantMsg = Message.fromToolCalls(this.toolCalls, response.content || '');
          this.memory.addMessage(assistantMsg);
          return this.toolCalls.length > 0;
        }
        
        return false;
      }
    } catch (error) {
      logger.error(`Error in think: ${error}`);
      return false;
    }
  }

  /**
   * 执行动作
   */
  protected async act(): Promise<string> {
    if (!this.toolCalls || this.toolCalls.length === 0) {
      return 'No tools to execute';
    }

    const results: string[] = [];

    for (const command of this.toolCalls) {
      logger.info(`🔧 Executing tool: ${command.function.name}`);
      
      const result = await this.executeTool(command);
      
      logger.info(`🎯 Tool '${command.function.name}' completed its mission! Result: ${result}`);

      // 添加工具响应到内存
      const toolMsg = Message.toolMessage(
        result,
        command.function.name,
        command.id
      );
      
      this.memory.addMessage(toolMsg);
      results.push(result);
    }

    return results.join('\n\n');
  }

  /**
   * 执行单个工具调用
   */
  private async executeTool(command: ToolCall): Promise<string> {
    if (!command || !command.function || !command.function.name) {
      return 'Error: Invalid command format';
    }

    const name = command.function.name;
    
    if (!this.availableTools.toolMap[name]) {
      return `Error: Unknown tool '${name}'`;
    }

    try {
      // 解析参数
      const args = JSON.parse(command.function.arguments || '{}');

      // 执行工具
      logger.info(`🔧 Activating tool: '${name}'...`);
      const result = await this.availableTools.execute(name, args);

      // 格式化结果
      const observation = result
        ? `Observed output of cmd \`${name}\` executed:\n${String(result)}`
        : `Cmd \`${name}\` completed with no output`;

      // 处理特殊工具
      await this.handleSpecialTool(name, result);

      return observation;
    } catch (error) {
      if (error instanceof SyntaxError) {
        const errorMsg = `Error parsing arguments for ${name}: Invalid JSON format`;
        logger.error(`📝 Oops! The arguments for '${name}' don't make sense - invalid JSON`);
        return `Error: ${errorMsg}`;
      } else {
        const errorMsg = `⚠️ Tool '${name}' encountered a problem: ${error}`;
        logger.error(errorMsg);
        return `Error: ${errorMsg}`;
      }
    }
  }

  /**
   * 处理特殊工具执行和状态变化
   */
  private async handleSpecialTool(name: string, result: any): Promise<void> {
    if (!this.isSpecialTool(name)) {
      return;
    }

    if (this.shouldFinishExecution(name, result)) {
      // 设置代理状态为已完成
      logger.info(`🏁 Special tool '${name}' has completed the task!`);
      this.state = AgentState.FINISHED;
    }
  }

  /**
   * 判断工具执行是否应该结束代理
   */
  private shouldFinishExecution(name: string, result: any): boolean {
    return name.toLowerCase() === 'terminate';
  }

  /**
   * 检查工具名称是否在特殊工具列表中
   */
  private isSpecialTool(name: string): boolean {
    return this.specialToolNames.map(n => n.toLowerCase()).includes(name.toLowerCase());
  }
}