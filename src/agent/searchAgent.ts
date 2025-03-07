import { ToolCallAgent } from './toolCallAgent';
import { AgentConfig, AgentContext } from './base';
import { ToolCollection } from '../tool/toolCollection';
import { GoogleSearch } from '../tool/googleSearch';
import { BrowserUseTool } from '../tool/browserUseTool';
import { Terminate } from '../tool/terminate';
import { CreateChatCompletion } from '../tool/createChatCompletion';

/**
 * 搜索代理类
 */
export class SearchAgent extends ToolCallAgent {
  constructor(config: AgentConfig = { name: 'search' }, context: AgentContext = {}) {
    super({
      ...config,
      description: 'A search agent that can find and extract information from the web',
      systemPrompt: `You are a helpful search assistant that can find information on the internet.
You can use google_search to find relevant pages and browser_use to interact with them.
Always try to provide accurate and relevant information from reliable sources.
Format your responses in a clear and structured way.`,
      nextStepPrompt: `To find information:
1. Use google_search to find relevant pages
2. Use browser_use to open and extract information
3. Summarize the findings in a clear format
4. Use terminate when the task is complete

If you want to stop interaction, use \`terminate\` tool/function call.`,
      maxSteps: 10
    }, context);

    // 设置可用工具
    this.availableTools = new ToolCollection(
      new GoogleSearch(),
      new BrowserUseTool(),
      new CreateChatCompletion(),
      new Terminate()
    );
  }
} 