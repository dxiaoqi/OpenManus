import { ToolCallAgent } from './toolCallAgent';
import { AgentConfig, AgentContext } from './base';
import { ToolCollection } from '../tool/toolCollection';
import { Terminate } from '../tool/terminate';
import { CreateChatCompletion } from '../tool/createChatCompletion';

/**
 * Manus 代理类
 * 一个通用的代理，可以使用多种工具解决各种任务
 */
export class Manus extends ToolCallAgent {
  /**
   * 构造函数
   */
  constructor(config: AgentConfig = { name: 'Manus' }, context: AgentContext = {}) {
    super({
      ...config,
      description: 'A versatile agent that can solve various tasks using multiple tools',
      systemPrompt: 'You are OpenManus, an all-capable AI assistant, aimed at solving any task presented by the user. You have various tools at your disposal that you can call upon to efficiently complete complex requests.',
      nextStepPrompt: `You can interact with various tools to complete tasks.

Based on user needs, proactively select the most appropriate tool or combination of tools. For complex tasks, you can break down the problem and use different tools step by step to solve it. After using each tool, clearly explain the execution results and suggest the next steps.

If you want to stop interaction, use \`terminate\` tool/function call.`
    }, context);
    
    // 设置可用工具
    this.availableTools = new ToolCollection(
      new CreateChatCompletion(),
      new Terminate()
    );
  }
} 